const fs = require('fs');

// Patch server.js
let server = fs.readFileSync('server.js', 'utf8');

const oldAuthClient = `function authClient(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Токен отсутствует' });
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'client' && decoded.role !== 'foreman') throw new Error();
        req.user = decoded;
        next();
    } catch(e) { res.status(403).json({ success: false, error: 'Доступ запрещен' }); }
}`;

const newAuthClient = `function authClient(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Токен отсутствует' });
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'client' && decoded.role !== 'foreman') throw new Error();
        req.user = decoded;

        const clientIdToCheck = decoded.role === 'client' ? decoded.id : decoded.clientId;
        prisma.client.findUnique({ where: { id: clientIdToCheck } }).then(client => {
            if (!client || !client.isActive) return res.status(403).json({ success: false, error: 'Аккаунт заблокирован' });
            if (client.trialEndsAt && new Date() > client.trialEndsAt) {
                return res.status(403).json({ success: false, errorCode: 'TRIAL_EXPIRED', error: 'Ваш 14-дневный пробный период истек.' });
            }
            next();
        }).catch(err => {
            res.status(500).json({ success: false, error: 'DB Error' });
        });
    } catch(e) { res.status(403).json({ success: false, error: 'Доступ запрещен' }); }
}`;

if (server.includes(oldAuthClient)) {
    server = server.replace(oldAuthClient, newAuthClient);
    fs.writeFileSync('server.js', server, 'utf8');
    console.log("Patched authClient in server.js");
} else {
    console.log("oldAuthClient not found. Already patched?");
}

// Patch admin.js with global fetch interceptor
let admin = fs.readFileSync('public/admin.js', 'utf8');
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
                    title: 'Пробный период завершен',
                    text: 'Ваш 14-дневный пробный период подошел к концу. Для продолжения использования системы, пожалуйста, оставьте заявку на подключение.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#9ca3af',
                    confirmButtonText: 'Оформить заявку',
                    cancelButtonText: 'Позже'
                }).then((result) => {
                    logout();
                    if (result.isConfirmed) {
                        window.location.href = 'index.html#order';
                    }
                });
            }
        } catch(e) {}
    }
    return res;
};
`;

if (!admin.includes('Global fetch interceptor for TRIAL_EXPIRED')) {
    admin = interceptor + "\n" + admin;
    fs.writeFileSync('public/admin.js', admin, 'utf8');
    console.log("Patched admin.js with fetch interceptor");
} else {
    console.log("admin.js already has interceptor");
}
