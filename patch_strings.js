const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

// 1. Simplify strings in i18n
html = html.replace(/expense_amt: "Сумма \(например 50\)"/, 'expense_amt: "Сумма"');
html = html.replace(/expense_desc: "Описание \(на что потрачено\)"/, 'expense_desc: "Описание"');

html = html.replace(/expense_amt: "Amount \(e\.g\. 50\)"/, 'expense_amt: "Amount"');
html = html.replace(/expense_desc: "Description \(what it was for\)"/, 'expense_desc: "Description"');

html = html.replace(/expense_amt: "סכום \(למשל 50\)"/, 'expense_amt: "סכום"');
html = html.replace(/expense_desc: "תיאור \(על מה שולם\)"/, 'expense_desc: "תיאור"');

html = html.replace(/expense_amt: "المبلغ \(مثلا 50\)"/, 'expense_amt: "المبلغ"');
html = html.replace(/expense_desc: "الوصف \(على ماذا أنفق\)"/, 'expense_desc: "الوصف"');

// 2. Simplify the saved text
const oldNoteCode = "if(amt) noteText = `${i18n[currentLang].expense_btn}: ${amt} ₪. ${i18n[currentLang].expense_desc.split(' ')[0]}: ${desc}`;";
const newNoteCode = "if(amt) noteText = `${i18n[currentLang].expense_amt}: ${amt} ₪. ${i18n[currentLang].expense_desc}: ${desc}`;";
html = html.replace(oldNoteCode, newNoteCode);

fs.writeFileSync('public/app.html', html, 'utf8');
console.log('Fixed texts in app.html');
