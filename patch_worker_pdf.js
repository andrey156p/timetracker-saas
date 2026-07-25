const fs = require('fs');

let html = fs.readFileSync('public/app.html', 'utf8');

if (!html.includes('jspdf.umd.min.js')) {
    const scripts = `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>`;
    html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com"></script>\n    ' + scripts);
}

const startIdx = html.indexOf('function downloadReportCSV(dailyData, month, totals) {');
let endIdx = html.indexOf('</script>', startIdx);
// Find the last function brace
const sub = html.substring(startIdx, endIdx);
const lastBraceIdx = sub.lastIndexOf('}');
endIdx = startIdx + lastBraceIdx + 1;

const newLogic = `
        const hebrewToLatin = {
            'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'CH', 'ט': 'T', 'י': 'Y', 'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M', 'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'ף': 'P', 'צ': 'TS', 'ץ': 'TS', 'ק': 'K', 'ר': 'R', 'ש': 'SH', 'ת': 'T',
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya', '₪': ' ILS'
        };

        function transliterate(str) {
            if (!str) return '';
            return String(str).split('').map(char => hebrewToLatin[char] || char).join('');
        }

        function downloadReportCSV(dailyData, month, totals) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(\`Worker Report - \${month}\`, 14, 20);
            
            const tableBody = [];
            for (let d in dailyData) {
                const dateParts = d.split('-');
                const formattedDate = dateParts.length === 3 ? \`\${dateParts[2]}/\${dateParts[1]}/\${dateParts[0]}\` : d;
                tableBody.push([formattedDate, formatHM(dailyData[d])]);
            }

            tableBody.push(['', '']);
            tableBody.push([transliterate(i18n[currentLang].report_total), formatHM(totals.totalHours)]);
            tableBody.push([transliterate(i18n[currentLang].report_over), formatHM(totals.overtimeHours)]);
            tableBody.push([transliterate(i18n[currentLang].report_sat), formatHM(totals.saturdayHours)]);
            tableBody.push([transliterate(i18n[currentLang].report_night), formatHM(totals.nightHours)]);

            doc.autoTable({
                startY: 30,
                head: [[transliterate(i18n[currentLang].date), transliterate(i18n[currentLang].hours)]],
                body: tableBody,
                theme: 'grid',
                styles: { font: 'helvetica' }
            });

            doc.save(\`Report_\${localStorage.getItem('empId') || 'Worker'}_\${month}.pdf\`);
        }
`;

html = html.substring(0, startIdx) + newLogic.trim() + '\n' + html.substring(endIdx);

fs.writeFileSync('public/app.html', html, 'utf8');
console.log('Successfully patched app.html for PDF reports.');
