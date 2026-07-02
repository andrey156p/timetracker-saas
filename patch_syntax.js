const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

const startIdx = html.indexOf('async function addExpenseNote');
const endIdx = html.indexOf('function downloadReportCSV');

if (startIdx !== -1 && endIdx !== -1) {
    const newExpenseNote = `async function addExpenseNote() {
            const { value: formValues } = await Swal.fire({
                title: i18n[currentLang].expense_title,
                html:
                    '<input id="swal-expense-amt" type="number" step="0.01" class="swal2-input" placeholder="' + i18n[currentLang].expense_amt + '">' +
                    '<textarea id="swal-expense-desc" class="swal2-textarea" placeholder="' + i18n[currentLang].expense_desc + '"></textarea>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: i18n[currentLang].save,
                cancelButtonText: i18n[currentLang].cancel,
                preConfirm: () => {
                    const amt = document.getElementById('swal-expense-amt').value;
                    const desc = document.getElementById('swal-expense-desc').value;
                    if (!desc) {
                        Swal.showValidationMessage(i18n[currentLang].expense_req);
                    }
                    let noteText = desc;
                    if(amt) noteText = \`\${i18n[currentLang].expense_btn}: \${amt} ₪. \${i18n[currentLang].expense_desc.split(' ')[0]}: \${desc}\`;
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
                        Swal.fire({ icon: 'success', title: i18n[currentLang].saved, timer: 1500, showConfirmButton: false });
                    } else {
                        Swal.fire({ icon: 'error', title: r.error });
                    }
                } catch(e) {
                    Swal.fire({ icon: 'error', title: i18n[currentLang].error });
                }
            }
        }

        `;
    
    html = html.substring(0, startIdx) + newExpenseNote + html.substring(endIdx);
    fs.writeFileSync('public/app.html', html, 'utf8');
    console.log('Fixed syntax error in app.html');
} else {
    console.log('Indexes not found!');
}
