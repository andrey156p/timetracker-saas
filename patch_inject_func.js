const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

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
                        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

// Insert the function right before "function downloadReportCSV" or just before "init();"
if (!html.includes('function addExpenseNote')) {
    html = html.replace('function downloadReportCSV', scriptInject + '\n        function downloadReportCSV');
    fs.writeFileSync('public/app.html', html, 'utf8');
    console.log('Injected addExpenseNote');
} else {
    console.log('Already exists');
}
