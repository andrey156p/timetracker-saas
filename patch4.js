const fs = require('fs');

let code = fs.readFileSync('public/admin.js', 'utf8');

const startStr = "async function generatePDFReport() {";
const endStr = "async function generateCSVReport() {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `const hebrewToLatin = {
    'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'CH', 'ט': 'T', 'י': 'Y', 'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M', 'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'ף': 'P', 'צ': 'TS', 'ץ': 'TS', 'ק': 'K', 'ר': 'R', 'ש': 'SH', 'ת': 'T',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

function transliterate(str) {
    if (!str) return '';
    return str.split('').map(char => hebrewToLatin[char] || char).join('');
}

async function generatePDFReport() {
    const workerId = document.getElementById('pdf-worker-id').value;
    const month = document.getElementById('pdf-month').value;
    if (!month) return Swal.fire('Error', 'Please select a month', 'error');
    if (!workerId) return Swal.fire('Error', 'Please select a worker', 'error');

    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
        const response = await fetch(\`\${API_URL}/owner/reports?month=\${month}\`);
        if (!response.ok) throw new Error('Failed to fetch report data');
        const r = await response.json();

        const workers = {};
        r.data.forEach(row => {
            if (workerId !== 'all' && row.employeeId !== workerId) return;
            if (!workers[row.employeeId]) workers[row.employeeId] = { name: row.employeeName, rows: [] };
            workers[row.employeeId].rows.push(row);
        });

        if (Object.keys(workers).length === 0) {
            Swal.fire('Info', 'No records found for this selection', 'info');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        const { jsPDF } = window.jspdf;

        for (const [empId, data] of Object.entries(workers)) {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Monthly Timesheet Report', 14, 20);
            
            // Convert name to Latin
            const englishName = transliterate(data.name);

            doc.setFontSize(12);
            doc.text(\`Employee: \${englishName} (ID: \${empId})\`, 14, 30);
            doc.text(\`Month: \${month}\`, 14, 38);

            let sumTotal = 0, sumOvertime = 0, sumNight = 0, sumSat = 0, sumLunch = 0;
            const tableBody = [];

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
            
            const grossTotal = sumTotal + sumLunch;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(\`Total Hours (Gross): \${grossTotal.toFixed(2)}\`, 14, finalY + 10);
            doc.text(\`Total After Lunch Deduction: \${sumTotal.toFixed(2)}\`, 14, finalY + 16);
            doc.setFont(undefined, 'normal');
            doc.text(\`Total Overtime: \${sumOvertime.toFixed(2)}\`, 14, finalY + 22);
            doc.text(\`Total Night Hours: \${sumNight.toFixed(2)}\`, 14, finalY + 28);
            doc.text(\`Total Saturday Hours: \${sumSat.toFixed(2)}\`, 14, finalY + 34);

            const managerName = r.clientName ? transliterate(r.clientName) : 'Manager';
            doc.text(\`Manager: \${managerName}\`, 14, finalY + 50);
            doc.text(\`Date: ____________________\`, 14, finalY + 60);
            doc.text(\`Signature: ____________________\`, 100, finalY + 60);

            doc.save(\`Timesheet_\${empId}_\${month}.pdf\`);
        }

    } catch(e) {
        Swal.fire('Error', e.message, 'error');
    }

    btn.textContent = originalText;
    btn.disabled = false;
}

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

// Add GPS strict indicator to renderWorkers
code = code.replace(
    /\$\{e\.isDeleted \? ' <span class="text-xs text-red-500">\(Deleted\)<\/span>' : ''\}/g,
    `\${e.isDeleted ? ' <span class="text-xs text-red-500">(Deleted)</span>' : ''}\${e.requireGPS ? ' 📍' : ''}`
);

fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Patched successfully');
