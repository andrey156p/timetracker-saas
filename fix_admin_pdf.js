const fs = require('fs');
let code = fs.readFileSync('public/admin.js', 'utf8');

// 1. Add GPS Strict indicator
code = code.replace(
    /<div class="flex items-center">\$\{e\.empName\} \$\{onlineDot\}<\/div>/g,
    `<div class="flex items-center">\${e.empName} \${e.strictGps ? ' 📍' : ''} \${onlineDot}</div>`
);

// 2. Replace generatePDFReport entirely
const startStr = "async function generatePDFReport() {";
const endStr = "async function generateCSVReport() {";
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `async function generatePDFReport() {
    const workerId = document.getElementById('pdf-worker-id').value;
    const month = document.getElementById('pdf-month').value;
    if (!month) return Swal.fire('Error', 'Please select a month', 'error');

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const m = parseInt(monthStr) - 1;

    const startDate = new Date(year, m, 1);
    const endDate = new Date(year, m + 1, 0, 23, 59, 59, 999);
    
    // adjust to timezone offset to avoid JS date shifting when sending to server
    const startStr = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
    const endStr = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();

    const btn = document.getElementById('btn-generate-pdf');
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
        const res = await fetch(\`\${API_URL}/client/hours?startDate=\${startStr}&endDate=\${endStr}\`, { headers: authHeaders() });
        const r = await res.json();
        
        if (!r.success) throw new Error(r.error);

        let reportData = r.report;
        if (workerId !== 'ALL') {
            reportData = reportData.filter(x => x.empId === workerId);
        }

        if (reportData.length === 0) {
            Swal.fire('Info', 'No data found for the selected period.', 'info');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        // Group by empId
        const workers = {};
        reportData.forEach(row => {
            if (!workers[row.empId]) {
                workers[row.empId] = { name: row.name, rows: [] };
            }
            workers[row.empId].rows.push(row);
        });

        const { jsPDF } = window.jspdf;

        for (const [empId, data] of Object.entries(workers)) {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(18);
            doc.text('Monthly Timesheet Report', 14, 20);
            doc.setFontSize(12);
            
            const englishName = transliterate(data.name);
            doc.text(\`Employee: \${englishName} (ID: \${empId})\`, 14, 30);
            doc.text(\`Month: \${month}\`, 14, 38);

            const tableBody = [];
            let sumTotal = 0, sumOvertime = 0, sumNight = 0, sumSat = 0, sumLunch = 0;

            data.rows.forEach(r => {
                const dDate = new Date(r.date);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = days[dDate.getDay()];
                
                let startTimes = [], endTimes = [];
                if (r.times) {
                    const shifts = r.times.split(', ');
                    shifts.forEach(s => {
                        const parts = s.split(' - ');
                        if (parts.length === 2) {
                            startTimes.push(parts[0].replace('*', ''));
                            endTimes.push(parts[1].replace('*', ''));
                        }
                    });
                }

                tableBody.push([
                    r.date,
                    dayName,
                    startTimes.join('\\n') || '-',
                    endTimes.join('\\n') || '-',
                    r.lunchDeduction || '0',
                    r.overtimeHours || '0',
                    r.nightHours || '0',
                    r.saturdayHours || '0',
                    r.totalHours || '0',
                    r.notes ? transliterate(r.notes) : ''
                ]);

                sumLunch += parseFloat(r.lunchDeduction || 0);
                sumOvertime += parseFloat(r.overtimeHours || 0);
                sumNight += parseFloat(r.nightHours || 0);
                sumSat += parseFloat(r.saturdayHours || 0);
                sumTotal += parseFloat(r.totalHours || 0);
            });

            doc.autoTable({
                startY: 45,
                head: [['Date', 'Day', 'In', 'Out', 'Lunch Ded.', 'Overtime', 'Night', 'Saturday', 'Total Hrs', 'Notes']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: { 9: { cellWidth: 40 } },
            });

            let finalY = doc.lastAutoTable.finalY || 45;
            
            // Totals
            const grossTotal = sumTotal + sumLunch;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(\`Total Hours (Gross): \${grossTotal.toFixed(2)}\`, 14, finalY + 10);
            doc.text(\`Total After Lunch Deduction: \${sumTotal.toFixed(2)}\`, 14, finalY + 16);
            doc.setFont(undefined, 'normal');
            doc.text(\`Total Overtime: \${sumOvertime.toFixed(2)}\`, 14, finalY + 22);
            doc.text(\`Total Night Hours: \${sumNight.toFixed(2)}\`, 14, finalY + 28);
            doc.text(\`Total Saturday Hours: \${sumSat.toFixed(2)}\`, 14, finalY + 34);

            // Signature Area
            const managerName = r.clientName ? transliterate(r.clientName) : 'Manager';
            doc.text(\`Manager: \${managerName}\`, 14, finalY + 50);
            doc.text(\`Date: ____________________\`, 14, finalY + 60);
            doc.text(\`Signature: ____________________\`, 100, finalY + 60);

            doc.save(\`Timesheet_\${empId}_\${month}.pdf\`);
        }

    } catch(e) {
        Swal.fire('Error', e.message, 'error');
    }

    if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Patched admin.js successfully');
