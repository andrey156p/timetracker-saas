const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

const oldFunc = `async function createInvoice(clientId, start, end, amount) {
    if (amount <= 0) return Swal.fire({ icon: 'warning', title: 'Сумма равна 0' });
    const res = await fetch(\`\${API_URL}/admin/invoices\`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ clientId, startDate: start, endDate: end, amount })
    });
    const r = await res.json();
    if(r.success) {
        Swal.fire({ icon: 'success', title: 'Счёт выставлен!', timer: 1500, showConfirmButton: false });
    } else {
        Swal.fire({ icon: 'error', title: r.error });
    }
}`;

const newFunc = `async function createInvoice(clientId, start, end, amount) {
    try {
        if (amount <= 0) {
            Swal.fire({ icon: 'warning', title: 'Сумма равна 0', text: 'Невозможно выставить счет на нулевую сумму.' });
            return;
        }
        const res = await fetch(\`\${API_URL}/admin/invoices\`, {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ clientId, startDate: start, endDate: end, amount })
        });
        const r = await res.json();
        if (r.success) {
            await Swal.fire({ icon: 'success', title: 'Счёт выставлен!', timer: 1500, showConfirmButton: false });
            loadTab('owner-invoices');
        } else {
            Swal.fire({ icon: 'error', title: r.error });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Ошибка: ' + e.message });
    }
}`;

admin = admin.replace(oldFunc, newFunc);
fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('patched admin.js createInvoice');
