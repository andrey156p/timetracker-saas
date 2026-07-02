const fs = require('fs');
let data = fs.readFileSync('public/app.html', 'utf8');

// 1. Replace downloadReportCSV with downloadReportXLS
const oldDownload = /function downloadReportCSV[\s\S]*?link\.click\(\);\s*\}/s;
const newDownload = `function downloadReportCSV(dailyData, month, totals) {
            let tableHtml = \`
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8" />
                    <!--[if gte mso 9]>
                    <xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                    <x:Name>Отчёт</x:Name>
                    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
                    <![endif]-->
                    <style>
                        table { border-collapse: collapse; }
                        th, td { border: 1px solid #ccc; padding: 5px; }
                        th { background-color: #f3f4f6; }
                    </style>
                </head>
                <body dir="\${document.documentElement.dir}">
                    <table>
                        <tr><th>Дата (Date)</th><th>Часы (Hours)</th></tr>\`;
            
            for (let d in dailyData) {
                // Convert YYYY-MM-DD to DD/MM/YYYY
                const dateParts = d.split('-');
                const formattedDate = dateParts.length === 3 ? \`\${dateParts[2]}/\${dateParts[1]}/\${dateParts[0]}\` : d;
                tableHtml += \`<tr><td>\${formattedDate}</td><td>\${formatHM(dailyData[d])}</td></tr>\`;
            }
            
            tableHtml += \`
                        <tr><td></td><td></td></tr>
                        <tr><td><strong>\${i18n[currentLang].report_total}</strong></td><td><strong>\${formatHM(totals.totalHours)}</strong></td></tr>
                        <tr><td>\${i18n[currentLang].report_over}</td><td>\${formatHM(totals.overtimeHours)}</td></tr>
                        <tr><td>\${i18n[currentLang].report_sat}</td><td>\${formatHM(totals.saturdayHours)}</td></tr>
                        <tr><td>\${i18n[currentLang].report_night}</td><td>\${formatHM(totals.nightHours)}</td></tr>
                    </table>
                </body>
                </html>\`;

            const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", \`Report_\${empId}_\${month}.xls\`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }`;
data = data.replace(oldDownload, newDownload);

// 2. Add Expenses/Notes button
const oldReportsBtn = `<button onclick="openReports()" id="btn-reports" class="shrink-0 w-max mx-auto text-sm text-gray-500 underline text-center pb-2 cursor-pointer transition hover:text-gray-800 select-none" data-i18n="report_btn">Мои Отчёты</button>`;
const newReportsBtn = `
        <div class="flex space-x-4 w-full px-4 mb-2">
            <button onclick="addExpenseNote()" class="flex-1 shrink-0 mx-auto text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-lg py-2 cursor-pointer transition hover:bg-purple-100 font-bold select-none text-center shadow">Расходы / Заметки</button>
            <button onclick="openReports()" id="btn-reports" class="flex-1 shrink-0 mx-auto text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-2 cursor-pointer transition hover:bg-blue-100 font-bold select-none text-center shadow" data-i18n="report_btn">Мои Отчёты</button>
        </div>
`;
data = data.replace(oldReportsBtn, newReportsBtn);

// 3. Add addExpenseNote function
const scriptInject = `
        async function addExpenseNote() {
            const { value: formValues } = await Swal.fire({
                title: 'Добавить расход / заметку',
                html:
                    '<input id="swal-expense-amt" type="number" step="0.01" class="swal2-input" placeholder="Сумма (например 50)">' +
                    '<textarea id="swal-expense-desc" class="swal2-textarea" placeholder="Описание (на что потрачено, чеки, и т.д.)"></textarea>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Сохранить',
                cancelButtonText: 'Отмена',
                preConfirm: () => {
                    const amt = document.getElementById('swal-expense-amt').value;
                    const desc = document.getElementById('swal-expense-desc').value;
                    if (!desc) {
                        Swal.showValidationMessage('Пожалуйста, введите описание');
                    }
                    let noteText = desc;
                    if(amt) noteText = \`Расход: \${amt} ₪. Описание: \${desc}\`;
                    return noteText;
                }
            });

            if (formValues) {
                const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                const localDate = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
                
                try {
                    const res = await fetch(\`\${API_URL}/worker/notes\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ empId, date: localDate, noteText: formValues })
                    });
                    const r = await res.json();
                    if(r.success) {
                        Swal.fire({ icon: 'success', title: 'Сохранено', timer: 1500, showConfirmButton: false });
                    } else {
                        Swal.fire({ icon: 'error', title: r.error });
                    }
                } catch(e) {
                    Swal.fire({ icon: 'error', title: 'Ошибка сети' });
                }
            }
        }
`;
data = data.replace('</script>', scriptInject + '\n    </script>');

fs.writeFileSync('public/app.html', data, 'utf8');
console.log('Patched app.html successfully.');
