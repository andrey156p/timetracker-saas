const fs = require('fs');

// Patch server.js
let server = fs.readFileSync('server.js', 'utf8');
server = server.replace(
    `return res.status(403).json({ success: false, error: 'Ваш 14-дневный пробный период истек. Пожалуйста, свяжитесь с нами для оплаты подписки.' });`,
    `return res.status(403).json({ success: false, errorCode: 'TRIAL_EXPIRED', error: 'Ваш 14-дневный пробный период истек. Пожалуйста, свяжитесь с нами для оплаты подписки.' });`
);
fs.writeFileSync('server.js', server, 'utf8');
console.log("Patched server.js");

// Patch admin.js
let admin = fs.readFileSync('public/admin.js', 'utf8');
const targetStr = `
            errEl.textContent = r.error;
            errEl.classList.remove('hidden');`;

const replaceStr = `
            if (r.errorCode === 'TRIAL_EXPIRED') {
                Swal.fire({
                    title: 'Пробный период завершен',
                    text: 'Ваш 14-дневный пробный период подошел к концу. Для продолжения использования системы, пожалуйста, оставьте заявку на подключение.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#9ca3af',
                    confirmButtonText: 'Оформить заявку',
                    cancelButtonText: 'Позже'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'index.html#order';
                    }
                });
            } else {
                errEl.textContent = r.error;
                errEl.classList.remove('hidden');
            }`;

if (!admin.includes('TRIAL_EXPIRED')) {
    admin = admin.replace(targetStr, replaceStr);
    fs.writeFileSync('public/admin.js', admin, 'utf8');
    console.log("Patched admin.js");
} else {
    console.log("admin.js already patched");
}
