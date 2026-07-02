const fs = require('fs');

// 1. Patch app.html
let app = fs.readFileSync('public/app.html', 'utf8');

const oldAppCSV = `        function downloadReportCSV(dailyData, month, totals) {
            let html = \`
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8" /></head>
            <body>
                <table border="1">
                    <tr><th>Date</th><th>Hours</th></tr>\`;
            for (let d in dailyData) {
                html += \`<tr><td>\${d}</td><td>\${formatHM(dailyData[d])}</td></tr>\`;
            }
            html += \`<tr><td></td><td></td></tr>\`;
            html += \`<tr><td><b>\${i18n[currentLang].report_total}</b></td><td>\${formatHM(totals.totalHours)}</td></tr>\`;
            html += \`<tr><td><b>\${i18n[currentLang].report_over}</b></td><td>\${formatHM(totals.overtimeHours)}</td></tr>\`;
            html += \`<tr><td><b>\${i18n[currentLang].report_sat}</b></td><td>\${formatHM(totals.saturdayHours)}</td></tr>\`;
            html += \`<tr><td><b>\${i18n[currentLang].report_night}</b></td><td>\${formatHM(totals.nightHours)}</td></tr>\`;
            html += \`</table></body></html>\`;

            const blob = new Blob(["\\uFEFF", html], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", \`Report_\${empId}_\${month}.xls\`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }`;

const newAppCSV = `        function downloadReportCSV(dailyData, month, totals) {
            let csv = "\\uFEFF";
            csv += "Date,Hours\\n";
            for (let d in dailyData) {
                csv += \`"\${d}","\${formatHM(dailyData[d])}"\\n\`;
            }
            csv += "\\n";
            csv += \`"\${i18n[currentLang].report_total}","\${formatHM(totals.totalHours)}"\\n\`;
            csv += \`"\${i18n[currentLang].report_over}","\${formatHM(totals.overtimeHours)}"\\n\`;
            csv += \`"\${i18n[currentLang].report_sat}","\${formatHM(totals.saturdayHours)}"\\n\`;
            csv += \`"\${i18n[currentLang].report_night}","\${formatHM(totals.nightHours)}"\\n\`;

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", \`Report_\${empId}_\${month}.csv\`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }`;

if (app.includes('xmlns:o="urn:schemas-microsoft-com:office:office"')) {
    app = app.replace(oldAppCSV, newAppCSV);
    fs.writeFileSync('public/app.html', app, 'utf8');
    console.log('Patched app.html');
}

// 2. Patch admin.js
let admin = fs.readFileSync('public/admin.js', 'utf8');

const oldAdminCSVStart = `function exportClientHoursCSV() {
    try {
        if(!lastReportData || lastReportData.length === 0) return showToast('Нет данных для выгрузки. Сначала загрузите таблицу.');
        
        // Use a bulletproof Excel HTML string to completely bypass all comma/semicolon/locale issues
        const tableHtml = document.getElementById('export-container').outerHTML;
        const excelHtml = \`
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
                    body { font-family: sans-serif; }
                    table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
                    th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
                    th { background-color: #f3f4f6; }
                    h4 { margin: 10px 0 5px 0; font-size: 14pt; }
                </style>
            </head>
            <body dir="\${document.documentElement.dir}">
                \${tableHtml}
            </body>
            </html>
        \`;
        
        const blob = new Blob(["\\uFEFF", excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", \`report_daily_\${new Date().toISOString().split('T')[0]}.xls\`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch(e) {
        showToast(\`Ошибка при выгрузке отчёта: \${e.message}\`);
    }
}`;

const newAdminCSV = `function exportClientHoursCSV() {
    try {
        if(!lastReportData || lastReportData.length === 0) return showToast('Нет данных для выгрузки. Сначала загрузите таблицу.');
        
        let csv = "\\uFEFF"; // UTF-8 BOM
        lastReportData.forEach(grp => {
            csv += \`"\${grp.empName} (\${grp.empId})"\\n\`;
            csv += \`"Date","Times","Total Hours","Night Hours","Saturday Hours","Overtime"\\n\`;
            grp.rows.forEach(d => {
                csv += \`"\${d.date || '-'}","\${d.times || '-'}","\${formatHM(parseFloat(d.totalHours || 0))}","\${formatHM(parseFloat(d.nightHours || 0))}","\${formatHM(parseFloat(d.saturdayHours || 0))}","\${formatHM(parseFloat(d.overtimeHours || 0))}"\\n\`;
            });
            csv += "\\n";
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", \`report_daily_\${new Date().toISOString().split('T')[0]}.csv\`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch(e) {
        showToast(\`Ошибка при выгрузке отчёта: \${e.message}\`);
    }
}`;

if (admin.includes('exportClientHoursCSV()')) {
    admin = admin.replace(oldAdminCSVStart, newAdminCSV);
    fs.writeFileSync('public/admin.js', admin, 'utf8');
    console.log('Patched admin.js');
}
