const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// 1. Add /api/worker/notes Endpoint
const notesApi = `
app.post('/api/worker/notes', async (req, res) => {
    try {
        const { empId, noteText } = req.body;
        if (!empId || !noteText) return res.status(400).json({ error: 'Missing data' });
        
        const gf = await prisma.geofence.findUnique({
            where: { empId },
            include: { client: true }
        });
        
        if (!gf) return res.status(404).json({ error: 'Worker not found' });
        
        const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        const todayStr = tzDate.getFullYear() + '-' + String(tzDate.getMonth()+1).padStart(2,'0') + '-' + String(tzDate.getDate()).padStart(2,'0');
        
        const existingNote = await prisma.dailyNote.findUnique({
            where: {
                empId_date: { empId, date: todayStr }
            }
        });
        
        if (existingNote) {
            await prisma.dailyNote.update({
                where: { id: existingNote.id },
                data: { noteText: existingNote.noteText + ' | ' + noteText }
            });
        } else {
            await prisma.dailyNote.create({
                data: {
                    empId,
                    date: todayStr,
                    noteText,
                    clientId: gf.clientId
                }
            });
        }
        
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});
`;

if (!server.includes('/api/worker/notes')) {
    server = server.replace("app.get('/api/client/notes'", notesApi + "\napp.get('/api/client/notes'");
}

// 2. Fix Lunch Deduction Logic
// Old logic:
const oldLunchLogic = `
                        let diffHours = (outTime - inTime) / 3600000;
                        if (client.autoDeductLunch && diffHours >= 6) {
                            diffHours -= 0.5;
                            empDaily[log.empId][shiftDateKey].lunchDeduction += 0.5;
                        }
                        
                        empDaily[log.empId][shiftDateKey].totalHours += diffHours;`;

const newLunchLogic = `
                        empDaily[log.empId][shiftDateKey].intervals = empDaily[log.empId][shiftDateKey].intervals || [];
                        empDaily[log.empId][shiftDateKey].intervals.push({ in: inTime.getTime(), out: outTime.getTime() });

                        let diffHours = (outTime - inTime) / 3600000;
                        empDaily[log.empId][shiftDateKey].totalHours += diffHours;`;

server = server.replace(oldLunchLogic, newLunchLogic);

// Then insert the end-of-day lunch logic right before flattening the report:
const oldReportArray = `// Flatten into a report
        const report = [];`;

const endOfDayLogic = `
        // End-of-day lunch deduction logic
        if (client.autoDeductLunch) {
            for (const emp in empDaily) {
                for (const date in empDaily[emp]) {
                    const d = empDaily[emp][date];
                    if (d.totalHours >= 6) {
                        let hasBigGap = false;
                        if (d.intervals && d.intervals.length > 1) {
                            d.intervals.sort((a,b) => a.in - b.in);
                            for (let i = 0; i < d.intervals.length - 1; i++) {
                                let gapHours = (d.intervals[i+1].in - d.intervals[i].out) / 3600000;
                                if (gapHours >= 0.5) { hasBigGap = true; break; }
                            }
                        }
                        if (!hasBigGap) {
                            d.totalHours -= 0.5;
                            d.lunchDeduction = 0.5;
                        }
                    }
                }
            }
        }
        
        // Flatten into a report
        const report = [];`;

if (!server.includes('End-of-day lunch deduction logic')) {
    server = server.replace(oldReportArray, endOfDayLogic);
}

fs.writeFileSync('server.js', server, 'utf8');
console.log('patched server.js');
