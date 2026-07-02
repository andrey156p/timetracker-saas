const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

// 1. Update i18n
const translations = {
    ru: `remind_out: "Не забудьте нажать 'Выход' (смена скоро закончится)!",
                expense_btn: "Расходы", expense_title: "Расход / Заметка",
                expense_amt: "Сумма (например 50)", expense_desc: "Описание (на что потрачено)",
                expense_req: "Пожалуйста, введите описание", save: "Сохранить", cancel: "Отмена", saved: "Сохранено"`,
    en: `remind_out: "Don't forget to Clock Out (shift ends soon)!",
                expense_btn: "Expenses", expense_title: "Expense / Note",
                expense_amt: "Amount (e.g. 50)", expense_desc: "Description (what it was for)",
                expense_req: "Please enter a description", save: "Save", cancel: "Cancel", saved: "Saved"`,
    he: `remind_out: "אל תשכחו לדווח 'יציאה' (המשמרת מסתיימת בקרוב)!",
                expense_btn: "הוצאות", expense_title: "הוצאה / הערה",
                expense_amt: "סכום (למשל 50)", expense_desc: "תיאור (על מה שולם)",
                expense_req: "נא להזין תיאור", save: "שמור", cancel: "ביטול", saved: "נשמר"`,
    ar: `remind_out: "لا تنس تسجيل الخروج (ينتهي الدوام قريبا)!",
                expense_btn: "مصاريف", expense_title: "مصروف / ملاحظة",
                expense_amt: "المبلغ (مثلا 50)", expense_desc: "الوصف (على ماذا أنفق)",
                expense_req: "الرجاء إدخال الوصف", save: "حفظ", cancel: "إلغاء", saved: "تم الحفظ"`
};

for (const lang in translations) {
    const regex = new RegExp(`remind_out:\\s*["'].*?["']`);
    html = html.replace(regex, translations[lang]);
}

// 2. Fix the layout of the buttons
html = html.replace(
    /<div class="flex space-x-4 w-full px-4 mb-2">[\s\S]*?<\/div>/,
    `<div class="grid grid-cols-2 gap-3 w-full px-4 mb-4">
            <button onclick="addExpenseNote()" class="w-full text-xs sm:text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-lg py-3 cursor-pointer transition hover:bg-purple-100 font-bold select-none text-center shadow" data-i18n="expense_btn">Расходы / Заметки</button>
            <button onclick="openReports()" id="btn-reports" class="w-full text-xs sm:text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-3 cursor-pointer transition hover:bg-blue-100 font-bold select-none text-center shadow" data-i18n="report_btn">Мои Отчёты</button>
        </div>`
);

// 3. Update addExpenseNote to use i18n
const oldExpenseNote = /async function addExpenseNote\(\) \{[\s\S]*?\}\s*\}/;
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
                        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
        }`;

if (oldExpenseNote.test(html)) {
    html = html.replace(oldExpenseNote, newExpenseNote);
} else {
    console.log("Could not find addExpenseNote regex");
}

fs.writeFileSync('public/app.html', html, 'utf8');
console.log('Fixed UI and i18n in app.html successfully!');
