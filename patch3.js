const fs = require('fs');

let code = fs.readFileSync('public/admin.js', 'utf8');

const startMarker = "const isHe = currentLang === 'he';";
const endMarker = "await html2pdf().set(opt).from(container).save();";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `const isHe = currentLang === 'he';
            const isRu = currentLang === 'ru';

            const tTitle = isHe ? 'דוח שעות חודשי' : (isRu ? 'Месячный Отчет' : 'Monthly Timesheet Report');
            const tEmp = isHe ? 'עובד' : (isRu ? 'Сотрудник' : 'Employee');
            const tMonth = isHe ? 'חודש' : (isRu ? 'Месяц' : 'Month');

            const tDate = isHe ? 'תאריך' : (isRu ? 'Дата' : 'Date');
            const tDay = isHe ? 'יום' : (isRu ? 'День' : 'Day');
            const tIn = isHe ? 'כניסה' : (isRu ? 'Вход' : 'In');
            const tOut = isHe ? 'יציאה' : (isRu ? 'Выход' : 'Out');
            const tLunch = isHe ? 'ניכוי הפסקה' : (isRu ? 'Обед' : 'Lunch Ded.');
            const tOvertime = isHe ? 'שעות נוספות' : (isRu ? 'Переработка' : 'Overtime');
            const tNight = isHe ? 'לילה' : (isRu ? 'Ночь' : 'Night');
            const tSat = isHe ? 'שבת' : (isRu ? 'Суббота' : 'Saturday');
            const tTotal = isHe ? 'סה"כ שעות' : (isRu ? 'Итого часов' : 'Total Hrs');
            const tNotes = isHe ? 'הערות' : (isRu ? 'Заметки' : 'Notes');

            const tGross = isHe ? 'סה"כ שעות (ברוטו)' : (isRu ? 'Всего часов (Брутто)' : 'Total Hours (Gross)');
            const tAfterLunch = isHe ? 'סה"כ לאחר ניכוי הפסקה' : (isRu ? 'Итого после вычета обеда' : 'Total After Lunch Deduction');
            const tTotalOvertime = isHe ? 'סה"כ שעות נוספות' : (isRu ? 'Итого сверхурочных' : 'Total Overtime');
            const tTotalNight = isHe ? 'סה"כ שעות לילה' : (isRu ? 'Итого ночных часов' : 'Total Night Hours');
            const tTotalSat = isHe ? 'סה"כ שעות שבת' : (isRu ? 'Итого субботних часов' : 'Total Saturday Hours');

            const tManager = isHe ? 'מנהל' : (isRu ? 'Менеджер' : 'Manager');
            const tSigDate = isHe ? 'תאריך' : (isRu ? 'Дата' : 'Date');
            const tSignature = isHe ? 'חתימה' : (isRu ? 'Подпись' : 'Signature');

            const grossTotal = sumTotal + sumLunch;
            const managerName = r.clientName || tManager;
            
            const container = document.createElement('div');
            // Force width to simulate an A4 page width at 96 DPI, ensuring consistent rendering
            container.style.width = '800px'; 
            container.style.fontFamily = 'Helvetica, Arial, sans-serif';
            container.style.color = '#000';
            container.style.backgroundColor = '#fff';
            
            // Set element box-sizing to prevent padding from expanding the width
            container.style.boxSizing = 'border-box';
            
            container.innerHTML = \`
                <div style="padding: 30px; direction: \${isHe ? 'rtl' : 'ltr'}; background: #fff; width: 100%; box-sizing: border-box;">
                    <h2 style="color: #000; font-size: 22px; margin: 0 0 15px 0;">\${tTitle}</h2>
                    <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
                        <div><strong>\${tEmp}:</strong> \${data.name} (ID: \${empId})</div>
                        <div><strong>\${tMonth}:</strong> \${month}</div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tDate}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tDay}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tIn}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tOut}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tLunch}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tOvertime}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tNight}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tSat}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000;">\${tTotal}</th>
                                <th style="padding: 6px; border: 1px solid #d1d5db; text-align: \${isHe?'right':'left'}; font-weight: bold; color: #000; max-width: 150px;">\${tNotes}</th>
                            </tr>
                        </thead>
                        <tbody>\${trs.replace(/padding:4px;/g, 'padding:6px;').replace(/border:1px solid #ddd;/g, 'border:1px solid #d1d5db;')}</tbody>
                    </table>

                    <div style="font-size: 13px; line-height: 1.6; margin-bottom: 30px;">
                        <div><strong style="font-weight: bold;">\${tGross}:</strong> \${grossTotal.toFixed(2)}</div>
                        <div><strong style="font-weight: bold;">\${tAfterLunch}:</strong> \${sumTotal.toFixed(2)}</div>
                        <div>\${tTotalOvertime}: \${sumOvertime.toFixed(2)}</div>
                        <div>\${tTotalNight}: \${sumNight.toFixed(2)}</div>
                        <div>\${tTotalSat}: \${sumSat.toFixed(2)}</div>
                    </div>

                    <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px;">
                        <div style="width: 45%;">
                            <p style="margin: 5px 0;">\${tManager}: \${managerName}</p>
                            <p style="margin: 5px 0;">\${tSigDate}: _________________</p>
                        </div>
                        <div style="width: 45%;">
                            <p style="margin: 5px 0;">\${tSignature}: _________________</p>
                        </div>
                    </div>
                </div>
            \`;

            // Append container to document temporarily to ensure html2canvas computes layout correctly
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     \`Timesheet_\${empId}_\${month}.pdf\`,
                image:        { type: 'jpeg', quality: 1.0 },
                html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 800 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
            
            // Clean up
            document.body.removeChild(container);`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Fixed PDF style layout and translations');
