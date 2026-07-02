const fs = require('fs');

let appjs = fs.readFileSync('public/app.js', 'utf8');
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

if (!appjs.includes('Global fetch interceptor for TRIAL_EXPIRED')) {
    appjs = interceptor + "\n" + appjs;
    fs.writeFileSync('public/app.js', appjs, 'utf8');
    console.log("Patched app.js with fetch interceptor");
} else {
    console.log("app.js already has interceptor");
}
