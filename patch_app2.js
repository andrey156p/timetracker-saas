const fs = require('fs');
let apphtml = fs.readFileSync('public/app.html', 'utf8');
const interceptor = `
// Global fetch interceptor for TRIAL_EXPIRED
const originalFetch = window.fetch;
window.fetch = async function() {
    const res = await originalFetch.apply(this, arguments);
    if (res.status === 403) {
        const clone = res.clone();
        try {
            const data = await clone.json();
            if (data.errorCode === 'TRIAL_EXPIRED') {
                Swal.fire({
                    title: 'Система заблокирована',
                    text: 'Пробный период вашей компании завершен. Пожалуйста, свяжитесь с руководством.',
                    icon: 'error',
                    confirmButtonText: 'ОК'
                }).then(() => {
                    logout();
                });
            }
        } catch(e) {}
    }
    return res;
};
`;

if (!apphtml.includes('Global fetch interceptor for TRIAL_EXPIRED')) {
    apphtml = apphtml.replace('<script>', '<script>\n' + interceptor);
    fs.writeFileSync('public/app.html', apphtml, 'utf8');
    console.log("Patched app.html with fetch interceptor");
} else {
    console.log("app.html already has interceptor");
}
