const fs = require('fs');
let code = fs.readFileSync('public/admin.js', 'utf8');

const targetStart = "const { jsPDF } = window.jspdf;";
const targetEnd = "doc.save(`Timesheet_${empId}_${month}.pdf`);\n        }";

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd) + targetEnd.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers in admin.js", {startIndex, endIndex});
    process.exit(1);
}

const replacement = `        if (!window.html2pdf) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        for (const [empId, data] of Object.entries(workers)) {
            let sumTotal = 0, sumOvertime = 0, sumNight = 0, sumSat = 0, sumLunch = 0;
            
            let trs = '';
            data.rows.forEach(r => {
                const dDate = new Date(r.date);
                const days = isHe ? ['א\\'', 'ב\\'', 'ג\\'', 'ד\\'', 'ה\\'', 'ו\\'', 'שבת'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

                trs += \`
                    <tr>
                        <td style="padding:6px; border:1px solid #ddd;">\${r.date}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${dayName}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${startTimes.join('<br>') || '-'}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${endTimes.join('<br>') || '-'}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${r.lunchDeduction || '0'}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${r.overtimeHours || '0'}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${r.nightHours || '0'}</td>
                        <td style="padding:6px; border:1px solid #ddd;">\${r.saturdayHours || '0'}</td>
                        <td style="padding:6px; border:1px solid #ddd; font-weight:bold;">\${r.totalHours || '0'}</td>
                        <td style="padding:6px; border:1px solid #ddd; max-width: 150px; word-wrap: break-word;">\${r.notes || ''}</td>
                    </tr>
                \`;

                sumLunch += parseFloat(r.lunchDeduction || 0);
                sumOvertime += parseFloat(r.overtimeHours || 0);
                sumNight += parseFloat(r.nightHours || 0);
                sumSat += parseFloat(r.saturdayHours || 0);
                sumTotal += parseFloat(r.totalHours || 0);
            });

            const grossTotal = sumTotal + sumLunch;
            const title = isHe ? 'דוח שעות חודשי' : (currentLang==='ru' ? 'Месячный Отчет' : 'Monthly Timesheet Report');
            const managerName = r.clientName || 'Manager';
            
            const container = document.createElement('div');
            container.style.fontFamily = 'Inter, sans-serif';
            container.style.color = '#333';
            container.innerHTML = \`
                <div style="padding: 30px; direction: \${isHe ? 'rtl' : 'ltr'};">
                    <h2 style="color: #2563eb; font-size: 24px; margin-bottom: 15px;">\${title}</h2>
                    <p style="font-size: 14px; margin-bottom: 5px;"><strong>\${isHe ? 'עובד' : 'Employee'}:</strong> \${data.name} (ID: \${empId})</p>
                    <p style="font-size: 14px; margin-bottom: 20px;"><strong>\${isHe ? 'חודש' : 'Month'}:</strong> \${month}</p>
                    
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px;">
                        <thead>
                            <tr style="background-color: #3b82f6; color: white;">
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'תאריך' : 'Date'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'יום' : 'Day'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'כניסה' : 'In'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'יציאה' : 'Out'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'ניכוי הפסקה' : 'Lunch Ded.'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'שעות נוספות' : 'Overtime'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'לילה' : 'Night'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'שבת' : 'Saturday'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'סה"כ שעות' : 'Total Hrs'}</th>
                                <th style="padding: 8px; border: 1px solid #2563eb; text-align: \${isHe?'right':'left'};">\${isHe ? 'הערות' : 'Notes'}</th>
                            </tr>
                        </thead>
                        <tbody>\${trs}</tbody>
                    </table>

                    <div style="font-size: 14px; line-height: 1.6;">
                        <p><strong>\${isHe ? 'סה"כ שעות (ברוטו)' : 'Total Hours (Gross)'}:</strong> \${grossTotal.toFixed(2)}</p>
                        <p><strong>\${isHe ? 'סה"כ לאחר ניכוי הפסקה' : 'Total After Lunch Deduction'}:</strong> \${sumTotal.toFixed(2)}</p>
                        <p><strong>\${isHe ? 'סה"כ שעות נוספות' : 'Total Overtime'}:</strong> \${sumOvertime.toFixed(2)}</p>
                        <p><strong>\${isHe ? 'סה"כ שעות לילה' : 'Total Night Hours'}:</strong> \${sumNight.toFixed(2)}</p>
                        <p><strong>\${isHe ? 'סה"כ שעות שבת' : 'Total Saturday Hours'}:</strong> \${sumSat.toFixed(2)}</p>
                    </div>

                    <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 14px;">
                        <div style="width: 45%;">
                            <p>\${isHe ? 'מנהל' : 'Manager'}: \${managerName}</p>
                            <p>\${isHe ? 'תאריך' : 'Date'}: _________________</p>
                        </div>
                        <div style="width: 45%;">
                            <p>\${isHe ? 'חתימה' : 'Signature'}: _________________</p>
                        </div>
                    </div>
                </div>
            \`;

            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     \`Timesheet_\${empId}_\${month}.pdf\`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
        }`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Successfully patched admin.js');
