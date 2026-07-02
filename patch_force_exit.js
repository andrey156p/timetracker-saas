const fs = require('fs');

// --- SERVER.JS PATCH ---
let serverCode = fs.readFileSync('server.js', 'utf8');

const forceExitEndpoint = `
app.post('/api/client/employees/:id/force-exit', authClient, async (req, res) => {
    try {
        const empId = req.params.id;
        const geofence = await prisma.geofence.findFirst({ where: { empId, clientId: req.user.clientId } });
        if (!geofence) return res.status(404).json({ success: false, error: 'Работник не найден' });
        
        // Add "Выход" log
        await prisma.log.create({
            data: {
                empId,
                geofenceId: geofence.id,
                action: 'Выход',
                isManual: true,
                dateTime: new Date()
            }
        });
        
        // Add to daily notes
        const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        const todayStr = tzDate.getFullYear() + '-' + String(tzDate.getMonth()+1).padStart(2,'0') + '-' + String(tzDate.getDate()).padStart(2,'0');
        
        const existingNote = await prisma.dailyNote.findFirst({
            where: { clientId: req.user.clientId, empId, date: todayStr }
        });
        
        const noteMsg = 'Смена прервана руководителем';
        if (existingNote) {
            if (!existingNote.noteText.includes(noteMsg)) {
                await prisma.dailyNote.update({
                    where: { id: existingNote.id },
                    data: { noteText: existingNote.noteText + ' (' + noteMsg + ')' }
                });
            }
        } else {
            await prisma.dailyNote.create({
                data: { clientId: req.user.clientId, empId, date: todayStr, noteText: noteMsg }
            });
        }
        
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});
`;

// Insert before the last app.post or at the end
if (!serverCode.includes('/force-exit')) {
    serverCode += forceExitEndpoint;
    fs.writeFileSync('server.js', serverCode, 'utf8');
}

// --- PUBLIC/ADMIN.JS PATCH ---
let adminCode = fs.readFileSync('public/admin.js', 'utf8');

if (!adminCode.includes('forceExitWorker')) {
    // 1. Add forceExitWorker function
    adminCode += `
window.forceExitWorker = async function(empId) {
    if (!confirm('Вы уверены, что хотите принудительно завершить смену этому сотруднику?')) return;
    try {
        const res = await fetch(\`\${API_URL}/client/employees/\${empId}/force-exit\`, { method: 'POST', headers: authHeaders() });
        const r = await res.json();
        if (r.success) {
            Swal.fire('Успешно', 'Смена завершена', 'success');
            renderClientWorkers();
        } else {
            Swal.fire('Ошибка', r.error, 'error');
        }
    } catch(e) {
        Swal.fire('Ошибка', e.message, 'error');
    }
};
`;

    // 2. Add the button to renderClientWorkers
    // Find where the onlineDot is rendered and the actions column
    const searchHtml = `<button onclick="deleteWorker('\${e.empId}')" class="text-red-600 underline text-xs" data-i18n="delete"></button>`;
    const replaceHtml = `<button onclick="deleteWorker('\${e.empId}')" class="text-red-600 underline text-xs" data-i18n="delete"></button>
                \${e.isOnline ? \`<button onclick="forceExitWorker('\${e.empId}')" class="text-orange-600 underline text-xs ml-2 font-bold" title="Принудительно завершить смену">Завершить</button>\` : ''}`;
    
    adminCode = adminCode.replace(searchHtml, replaceHtml);
    fs.writeFileSync('public/admin.js', adminCode, 'utf8');
}

console.log("Patch complete");
