const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

// 1. Move injected functions out of the tailwind script tag
const tailwindScriptRegex = /<script src="https:\/\/cdn\.tailwindcss\.com">([\s\S]*?)<\/script>/;
const match = html.match(tailwindScriptRegex);
if (match && match[1].trim().length > 0) {
    const injectedCode = match[1];
    // Remove it from the tailwind script
    html = html.replace(tailwindScriptRegex, '<script src="https://cdn.tailwindcss.com"></script>');
    // Append it to the main script block
    html = html.replace('        init();\n', injectedCode + '\n        init();\n');
}

// 2. Fix downloadReportCSV
const downloadCsvStart = html.indexOf('function downloadReportCSV(dailyData, month, totals) {');
const downloadCsvEnd = html.indexOf('init();', downloadCsvStart);

if (downloadCsvStart !== -1 && downloadCsvEnd !== -1) {
    const oldFunc = html.substring(downloadCsvStart, downloadCsvEnd);
    const newFunc = `function downloadReportCSV(dailyData, month, totals) {
            let tableHtml = \`
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8" />
                    <style>
                        table { border-collapse: collapse; font-family: sans-serif; }
                        th, td { border: 1px solid #ccc; padding: 8px; }
                        th { background-color: #f3f4f6; font-weight: bold; }
                    </style>
                </head>
                <body dir="\${document.documentElement.dir}">
                    <table>
                        <tr><th>\${i18n[currentLang].date} (Date)</th><th>\${i18n[currentLang].hours} (Hours)</th></tr>\`;
            
            for (let d in dailyData) {
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
        }

        `;
    html = html.replace(oldFunc, newFunc);
}

fs.writeFileSync('public/app.html', html, 'utf8');
console.log('Fixed app.html successfully!');
