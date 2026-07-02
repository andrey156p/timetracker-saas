const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

const replacements = [
    {
        old: "if (!confirm('Снять ограничения пробного периода и сделать аккаунт бессрочным? / Remove trial limit?')) return;",
        new: "const result = await Swal.fire({ title: 'Снять ограничения?', text: 'Сделать аккаунт бессрочным? / Remove trial limit?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Да / Yes', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    },
    {
        old: "if (!confirm('ВНИМАНИЕ! Вы удаляете целую компанию/клиента и ВСЕ их данные (работников, счета, смены). Это действие необратимо! Вы уверены? / Delete client completely?')) return;",
        new: "const result = await Swal.fire({ title: 'ВНИМАНИЕ! Вы удаляете целую компанию/клиента', text: 'ВСЕ их данные (работники, счета, смены) будут удалены. Это действие необратимо! Вы уверены? / Delete client completely?', icon: 'error', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Да, УДАЛИТЬ', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    },
    {
        old: "const newPassword = prompt(\"Новый пароль:\");\n    if(!newPassword) return;",
        new: "const { value: newPassword } = await Swal.fire({ title: 'Новый пароль', input: 'text', inputPlaceholder: 'Введите новый пароль', showCancelButton: true });\n    if(!newPassword) return;"
    },
    {
        old: "if (!confirm('Удалить этот счёт? / Delete this invoice?')) return;",
        new: "const result = await Swal.fire({ title: 'Удалить этот счёт?', text: 'Delete this invoice?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить / Delete', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    },
    {
        old: "if(!confirm(\"Удалить?\")) return;",
        new: "const result = await Swal.fire({ title: 'Удалить?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить / Delete', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    },
    {
        old: "if(!confirm(\"Удалить бригадира?\")) return;",
        new: "const result = await Swal.fire({ title: 'Удалить бригадира?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить / Delete', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    },
    {
        old: "if (!confirm('Вы уверены, что хотите принудительно завершить смену этому сотруднику?')) return;",
        new: "const result = await Swal.fire({ title: 'Завершить смену?', text: 'Вы уверены, что хотите принудительно завершить смену этому сотруднику?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Завершить', cancelButtonText: 'Отмена' }); if (!result.isConfirmed) return;"
    },
    {
        old: "if (!confirm('Вы уверены, что хотите удалить эту заявку? / Are you sure?')) return;",
        new: "const result = await Swal.fire({ title: 'Удалить заявку?', text: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить / Delete', cancelButtonText: 'Отмена / Cancel' }); if (!result.isConfirmed) return;"
    }
];

replacements.forEach(r => {
    admin = admin.replace(r.old, r.new);
});

fs.writeFileSync('public/admin.js', admin, 'utf8');

// For app.html
let appHtml = fs.readFileSync('public/app.html', 'utf8');
appHtml = appHtml.replace(
    'empId = prompt("Enter ID / Введите ваш ID (телефон):");',
    `const { value: idVal } = await Swal.fire({
                    title: 'Ваш ID',
                    text: 'Введите ваш ID (телефон) / Enter ID',
                    input: 'text',
                    showCancelButton: true,
                    cancelButtonText: 'Отмена'
                });
                empId = idVal;`
);

// wait, the prompt in app.html is inside a non-async function? Let's check app.html
fs.writeFileSync('public/app.html', appHtml, 'utf8');

console.log('Replaced browser prompts with Swal');
