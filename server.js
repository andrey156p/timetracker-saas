const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

function getLocalOffsetMs(date) {
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    return tzDate.getTime() - utcDate.getTime();
}

const JWT_SECRET = 'SUPER_SECRET_TOKEN_V2';

// VAPID keys for Web Push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BDC7_mP6zO2tXq2u1SXYA__5PZ5VvR6N9u9O12RQKQYhYf8j8kM_EwYQJ1r1RjQzQ2B_yZ_wYx7_kYvFvR6N9u9O12RQKQYhYf8j8kM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'wA2_Z7gW8Z6X9Z_Z9W_Z_A';
try {
    webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);
} catch (e) {
    console.log("Web Push VAPID setup failed", e);
}

async function getOwnerPassword() {
    let settings = await prisma.saaSSettings.findFirst();
    if (!settings) settings = await prisma.saaSSettings.create({ data: {} });
    return settings.ownerPassword;
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// --- Middlewares ---
function authOwner(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Токен отсутствует' });
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'owner') throw new Error();
        req.user = decoded;
        next();
    } catch(e) { res.status(403).json({ success: false, error: 'Доступ запрещен' }); }
}

function authClient(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Токен отсутствует' });
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'client' && decoded.role !== 'foreman') throw new Error();
        req.user = decoded;
        next();
    } catch(e) { res.status(403).json({ success: false, error: 'Доступ запрещен' }); }
}

function requireClientRole(req, res, next) {
    if (req.user.role !== 'client') return res.status(403).json({ success: false, error: 'Доступ только для руководителя' });
    next();
}

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Check Owner
    const OWNER_PASSWORD = await getOwnerPassword();
    if (username === 'owner' && password === OWNER_PASSWORD) {
        const token = jwt.sign({ role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, role: 'owner', token });
    }

    // Check Client (Manager)
    const client = await prisma.client.findUnique({ where: { username } });
    if (client && client.password === password) {
        if (!client.isActive) return res.status(403).json({ success: false, error: 'Ваш аккаунт заблокирован за неуплату' });
        const token = jwt.sign({ role: 'client', clientId: client.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, role: 'client', token, clientId: client.id });
    }

    // Check Foreman
    const foreman = await prisma.foreman.findUnique({ where: { username } });
    if (foreman && foreman.password === password) {
        if (!foreman.isActive) return res.status(403).json({ success: false, error: 'Ваш аккаунт заблокирован' });
        const token = jwt.sign({ role: 'foreman', clientId: foreman.clientId, foremanId: foreman.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, role: 'foreman', token, clientId: foreman.clientId, foremanId: foreman.id });
    }

    res.status(401).json({ success: false, error: 'Неверные учетные данные' });
});

// Push notification subscription
app.post('/api/worker/subscribe', async (req, res) => {
    try {
        const { empId, subscription } = req.body;
        if (!empId || !subscription) return res.json({ success: false, error: 'Missing data' });
        
        await prisma.pushSubscription.create({
            data: {
                empId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        });
        
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==========================================
// OWNER ROUTES
// ==========================================
app.post('/api/admin/password', authOwner, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const currentPassword = await getOwnerPassword();
    if (oldPassword !== currentPassword) return res.status(403).json({ success: false, error: 'Неверный старый пароль' });
    if (!newPassword) return res.status(400).json({ success: false, error: 'Пустой новый пароль' });
    
    let settings = await prisma.saaSSettings.findFirst();
    await prisma.saaSSettings.update({
        where: { id: settings.id },
        data: { ownerPassword: newPassword }
    });
    
    res.json({ success: true });
});

app.get('/api/admin/clients', authOwner, async (req, res) => {
    const clients = await prisma.client.findMany({ 
        select: { 
            id: true, username: true, name: true, isActive: true, tariffMode: true, pricePerUser: true, pricePerHour: true,
            _count: { select: { foremen: true, geofences: true } }
        } 
    });
    res.json({ success: true, clients });
});

app.post('/api/admin/clients', authOwner, async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const client = await prisma.client.create({ data: { username, password, name } });
        res.json({ success: true, client });
    } catch (e) { res.status(400).json({ success: false, error: 'Логин уже существует' }); }
});

app.post('/api/admin/clients/:id/toggle', authOwner, async (req, res) => {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });
    await prisma.client.update({ where: { id }, data: { isActive: !client.isActive } });
    res.json({ success: true, isActive: !client.isActive });
});

app.post('/api/admin/clients/:id/reset', authOwner, async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    await prisma.client.update({ where: { id }, data: { password: newPassword } });
    res.json({ success: true });
});

app.get('/api/admin/billing', authOwner, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const clients = await prisma.client.findMany({
            include: {
                logs: {
                    where: {
                        dateTime: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    }
                },
                geofences: true
            }
        });

        const billingData = clients.map(client => {
            // Very naive hours calculation for billing summary
            // For real system, you'd match Entry/Exit
            let totalHours = 0;
            const sortedLogs = client.logs.sort((a, b) => a.dateTime - b.dateTime);
            const employeeSessions = {};
            
            sortedLogs.forEach(log => {
                if (!employeeSessions[log.empId]) employeeSessions[log.empId] = [];
                if (log.action === 'Вход') {
                    employeeSessions[log.empId].push({ in: log.dateTime, out: null });
                } else if (log.action === 'Выход') {
                    const sessions = employeeSessions[log.empId];
                    if (sessions && sessions.length > 0 && !sessions[sessions.length-1].out) {
                        sessions[sessions.length-1].out = log.dateTime;
                        const diffMs = log.dateTime - sessions[sessions.length-1].in;
                        totalHours += diffMs / (1000 * 60 * 60);
                    }
                }
            });

            let cost = 0;
            if (client.tariffMode === 'per_user') {
                const sDate = new Date(startDate);
                const eDate = new Date(endDate);
                let totalWorkerDays = 0;
                client.geofences.forEach(gf => {
                    const created = new Date(gf.createdAt);
                    // Start counting from either the billing period start or worker creation
                    const actualStart = created > sDate ? created : sDate;
                    if (actualStart <= eDate) {
                        const days = Math.ceil((eDate - actualStart) / (1000 * 60 * 60 * 24)) || 1; // At least 1 day if created on eDate
                        totalWorkerDays += days;
                    }
                });
                cost = totalWorkerDays * client.pricePerUser;
            } else if (client.tariffMode === 'per_hour') {
                cost = totalHours * client.pricePerHour;
            }

            return {
                id: client.id,
                name: client.name,
                activeEmployees: client.geofences.length,
                totalHours: totalHours.toFixed(2),
                cost: cost.toFixed(2),
                tariffMode: client.tariffMode
            };
        });

        res.json({ success: true, billingData });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// CRON endpoint to generate monthly invoices automatically
app.get('/api/cron/billing', async (req, res) => {
    try {
        // Simple security check using query param (in production use Authorization header with a secret)
        const cronSecret = process.env.CRON_SECRET || 'fallback_secret_123';
        if (req.query.secret !== cronSecret) {
            return res.status(401).json({ success: false, error: 'Unauthorized cron request' });
        }

        // Calculate previous month's date range
        const now = new Date();
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const clients = await prisma.client.findMany({
            where: { isActive: true },
            include: {
                logs: {
                    where: {
                        dateTime: {
                            gte: startOfPreviousMonth,
                            lte: endOfPreviousMonth
                        }
                    }
                },
                geofences: true
            }
        });

        let invoicesCreated = 0;

        for (const client of clients) {
            // Calculate cost
            let totalHours = 0;
            const sortedLogs = client.logs.sort((a, b) => a.dateTime - b.dateTime);
            const employeeSessions = {};
            
            sortedLogs.forEach(log => {
                if (!employeeSessions[log.empId]) employeeSessions[log.empId] = [];
                if (log.action === 'Вход') {
                    employeeSessions[log.empId].push({ in: log.dateTime, out: null });
                } else if (log.action === 'Выход') {
                    const sessions = employeeSessions[log.empId];
                    if (sessions && sessions.length > 0 && !sessions[sessions.length-1].out) {
                        sessions[sessions.length-1].out = log.dateTime;
                        const diffMs = log.dateTime - sessions[sessions.length-1].in;
                        totalHours += diffMs / (1000 * 60 * 60);
                    }
                }
            });

            let cost = 0;
            if (client.tariffMode === 'per_user') {
                let totalWorkerDays = 0;
                client.geofences.forEach(gf => {
                    const created = new Date(gf.createdAt);
                    const actualStart = created > startOfPreviousMonth ? created : startOfPreviousMonth;
                    if (actualStart <= endOfPreviousMonth) {
                        const days = Math.ceil((endOfPreviousMonth - actualStart) / (1000 * 60 * 60 * 24)) || 1;
                        totalWorkerDays += days;
                    }
                });
                cost = totalWorkerDays * client.pricePerUser;
            } else if (client.tariffMode === 'per_hour') {
                cost = totalHours * client.pricePerHour;
            }

            if (cost > 0) {
                // Check if invoice already exists for this client and period to avoid duplicates
                const existingInvoice = await prisma.invoice.findFirst({
                    where: {
                        clientId: client.id,
                        startDate: startOfPreviousMonth,
                        endDate: endOfPreviousMonth
                    }
                });

                if (!existingInvoice) {
                    await prisma.invoice.create({
                        data: {
                            clientId: client.id,
                            startDate: startOfPreviousMonth,
                            endDate: endOfPreviousMonth,
                            amount: parseFloat(cost.toFixed(2)),
                            status: 'pending'
                        }
                    });
                    invoicesCreated++;
                }
            }
        }

        res.json({ success: true, message: `Generated ${invoicesCreated} invoices for previous month.` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/clients/:id/tariff', authOwner, async (req, res) => {
    try {
        const { tariffMode, price } = req.body;
        const data = { tariffMode };
        if (tariffMode === 'per_user') {
            data.pricePerUser = parseFloat(price) || 0;
            data.pricePerHour = 0;
        } else {
            data.pricePerHour = parseFloat(price) || 0;
            data.pricePerUser = 0;
        }
        await prisma.client.update({
            where: { id: req.params.id },
            data
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/admin/invoices', authOwner, async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { client: { select: { name: true, username: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, invoices });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/invoices', authOwner, async (req, res) => {
    try {
        const { clientId, startDate, endDate, amount } = req.body;
        const invoice = await prisma.invoice.create({
            data: {
                clientId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                amount: parseFloat(amount) || 0
            }
        });
        res.json({ success: true, invoice });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/invoices/:id/toggle', authOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(id) } });
        const newStatus = invoice.status === 'pending' ? 'paid' : 'pending';
        await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, status: newStatus });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete('/api/admin/invoices/:id', authOwner, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.invoice.delete({ where: { id } });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// ==========================================
// FOREMAN (CLIENT) ROUTES
// ==========================================
// ==========================================
// FOREMAN ROUTES (Client level)
// ==========================================
app.get('/api/client/foremen', authClient, requireClientRole, async (req, res) => {
    const foremen = await prisma.foreman.findMany({ where: { clientId: req.user.clientId } });
    res.json({ success: true, foremen });
});

app.post('/api/client/foremen', authClient, requireClientRole, async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const foreman = await prisma.foreman.create({ data: { username, password, name, clientId: req.user.clientId } });
        res.json({ success: true, foreman });
    } catch (e) { res.status(400).json({ success: false, error: 'Логин уже существует' }); }
});

app.post('/api/client/foremen/:id/toggle', authClient, requireClientRole, async (req, res) => {
    const { id } = req.params;
    const foreman = await prisma.foreman.findUnique({ where: { id, clientId: req.user.clientId } });
    if (!foreman) return res.status(404).json({ success: false });
    await prisma.foreman.update({ where: { id }, data: { isActive: !foreman.isActive } });
    res.json({ success: true, isActive: !foreman.isActive });
});

app.delete('/api/client/foremen/:id', authClient, requireClientRole, async (req, res) => {
    const { id } = req.params;
    await prisma.foreman.delete({ where: { id, clientId: req.user.clientId } });
    res.json({ success: true });
});

// ==========================================
// EMPLOYEES ROUTES
// ==========================================
app.get('/api/client/employees', authClient, async (req, res) => {
    let where = { clientId: req.user.clientId };
    if (req.user.role === 'foreman') where.foremanId = req.user.foremanId;
    
    let employees = await prisma.geofence.findMany({ where });
    
    // Check if they are online
    for (let emp of employees) {
        const openLog = await prisma.log.findFirst({
            where: { clientId: req.user.clientId, empId: emp.empId, action: 'Вход' },
            orderBy: { dateTime: 'desc' }
        });
        const lastLog = await prisma.log.findFirst({
            where: { clientId: req.user.clientId, empId: emp.empId },
            orderBy: { dateTime: 'desc' }
        });
        
        emp.isOnline = openLog && lastLog && lastLog.id === openLog.id;
    }

    res.json({ success: true, employees });
});

app.post('/api/client/employees', authClient, requireClientRole, async (req, res) => {
    const { empId, empName, lat, lng, radius, isMobile, address, smS, smE, seS, seE, snS, snE, foremanId } = req.body;
    try {
        await prisma.geofence.create({
            data: {
                clientId: req.user.clientId,
                empId, empName, lat: parseFloat(lat)||0, lng: parseFloat(lng)||0, radius: parseFloat(radius)||0, isMobile: !!isMobile, address: address || null,
                shiftMorningStart: smS || null, shiftMorningEnd: smE || null,
                shiftEveningStart: seS || null, shiftEveningEnd: seE || null,
                shiftNightStart: snS || null, shiftNightEnd: snE || null,
                foremanId: foremanId || null
            }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: 'Работник с таким ID уже существует' });
    }
});

app.put('/api/client/employees/:empId', authClient, requireClientRole, async (req, res) => {
    const { empName, lat, lng, radius, isMobile, address, smS, smE, seS, seE, snS, snE, foremanId } = req.body;
    try {
        await prisma.geofence.update({
            where: { empId: req.params.empId },
            data: {
                empName, lat: parseFloat(lat)||0, lng: parseFloat(lng)||0, radius: parseFloat(radius)||0, isMobile: !!isMobile, address: address || null,
                shiftMorningStart: smS || null, shiftMorningEnd: smE || null,
                shiftEveningStart: seS || null, shiftEveningEnd: seE || null,
                shiftNightStart: snS || null, shiftNightEnd: snE || null,
                foremanId: foremanId || null
            }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: 'Ошибка сохранения работника' });
    }
});

app.get('/api/client/schedule', authClient, async (req, res) => {
    const schedules = await prisma.schedule.findMany({ where: { clientId: req.user.clientId } });
    res.json({ success: true, schedules });
});

app.post('/api/client/schedule', authClient, async (req, res) => {
    const { geofenceId, dayOfWeek, shiftType } = req.body;
    try {
        const existing = await prisma.schedule.findUnique({
            where: {
                geofenceId_dayOfWeek: { geofenceId: parseInt(geofenceId), dayOfWeek: parseInt(dayOfWeek) }
            }
        });
        
        if (existing) {
            await prisma.schedule.update({
                where: { id: existing.id },
                data: { shiftType }
            });
        } else {
            await prisma.schedule.create({
                data: {
                    geofenceId: parseInt(geofenceId),
                    dayOfWeek: parseInt(dayOfWeek),
                    shiftType,
                    clientId: req.user.clientId
                }
            });
        }
        res.json({ success: true });
    } catch(e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Ошибка сохранения расписания' });
    }
});

app.delete('/api/client/employees/:id', authClient, async (req, res) => {
    await prisma.geofence.delete({ where: { empId: req.params.id } });
    res.json({ success: true });
});

app.post('/api/admin/clients/:id/reset', authOwner, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ success: false, error: 'Новый пароль обязателен' });
        await prisma.client.update({
            where: { id: req.params.id },
            data: { password: newPassword }
        });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/admin/clients/:id', authOwner, async (req, res) => {
    try {
        await prisma.client.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.patch('/api/client/employees/:empId/mobile', authClient, async (req, res) => {
    try {
        const { isMobile } = req.body;
        await prisma.geofence.update({
            where: { empId: req.params.empId },
            data: { isMobile: !!isMobile }
        });
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/client/settings', authClient, async (req, res) => {
    const client = await prisma.client.findUnique({ where: { id: req.user.clientId } });
    res.json({ success: true, settings: client });
});

app.post('/api/client/settings', authClient, requireClientRole, async (req, res) => {
    const { shiftMorningStart, shiftMorningEnd, shiftEveningStart, shiftEveningEnd, shiftNightStart, shiftNightEnd, autoDeductLunch } = req.body;
    await prisma.client.update({
        where: { id: req.user.clientId },
        data: { 
            shiftMorningStart, shiftMorningEnd, 
            shiftEveningStart, shiftEveningEnd, 
            shiftNightStart, shiftNightEnd,
            autoDeductLunch: !!autoDeductLunch
        }
    });
    res.json({ success: true });
});

app.post('/api/client/logs/manual', authClient, async (req, res) => {
    try {
        const { empId, date, timeIn, timeOut } = req.body;
        if (!empId || !date || !timeIn || !timeOut) return res.status(400).json({ success: false, error: "Missing fields" });

        // Build valid Date objects in local time equivalent
        const [inH, inM] = timeIn.split(':').map(Number);
        const [outH, outM] = timeOut.split(':').map(Number);

        // Treat 'date' as a local date string (e.g. "2024-05-10")
        const [yyyy, mm, dd] = date.split('-');
        
        // Determine Israel offset for that specific date (+03:00 or +02:00)
        const dummyDate = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', timeZoneName: 'shortOffset' });
        const parts = formatter.formatToParts(dummyDate);
        const offsetPart = parts.find(p => p.type === 'timeZoneName').value;
        let offset = '+02:00';
        if (offsetPart.includes('+3')) offset = '+03:00';
        if (offsetPart.includes('+2')) offset = '+02:00';

        const inDate = new Date(`${yyyy}-${mm}-${dd}T${timeIn}:00${offset}`);
        const outDate = new Date(`${yyyy}-${mm}-${dd}T${timeOut}:00${offset}`);
        
        // If outDate is before inDate (e.g. night shift), add 1 day to outDate
        if (outDate < inDate) {
            outDate.setDate(outDate.getDate() + 1);
        }

        const geofence = await prisma.geofence.findUnique({ where: { empId } });

        const dateStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00${offset}`);
        const dateEnd = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999${offset}`);

        await prisma.$transaction([
            prisma.log.deleteMany({
                where: {
                    empId,
                    clientId: req.user.clientId,
                    dateTime: {
                        gte: dateStart,
                        lte: dateEnd
                    }
                }
            }),
            prisma.log.create({
                data: {
                    empId,
                    clientId: req.user.clientId,
                    action: "Вход",
                    dateTime: inDate,
                    isManual: true,
                    geofenceId: geofence ? geofence.id : null
                }
            }),
            prisma.log.create({
                data: {
                    empId,
                    clientId: req.user.clientId,
                    action: "Выход",
                    dateTime: outDate,
                    isManual: true,
                    geofenceId: geofence ? geofence.id : null
                }
            })
        ]);

        res.json({ success: true });
    } catch(e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/client/hours', authClient, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const client = await prisma.client.findUnique({ where: { id: req.user.clientId } });
        const logs = await prisma.log.findMany({
            where: {
                clientId: req.user.clientId,
                dateTime: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                },
                ...(req.user.role === 'foreman' ? { geofence: { foremanId: req.user.foremanId } } : {})
            },
            include: { geofence: true },
            orderBy: { dateTime: 'asc' }
        });

        // Parse "HH:mm" to minutes
        const parseTime = (t) => { if(!t) return 0; const [h,m] = t.split(':'); return parseInt(h)*60 + parseInt(m); };
        const nsStart = parseTime(client.shiftNightStart || "22:00");
        const nsEnd = parseTime(client.shiftNightEnd || "06:00");
        const isSaturday = (d) => d.getDay() === 6;

        // Group by employee AND day
        // empDaily: { empId: { dateKey: { ...stats } } }
        const empDaily = {};
        const empSessions = {};

        logs.forEach(log => {
            const dateKey = log.dateTime.toISOString().split('T')[0];
            
            const isDeleted = !log.geofence;
            const empName = isDeleted ? '' : log.geofence.empName;
            
            if (!empDaily[log.empId]) {
                empDaily[log.empId] = {};
            }
            if (!empDaily[log.empId][dateKey]) {
                empDaily[log.empId][dateKey] = {
                    name: empName,
                    isDeleted: isDeleted,
                    totalHours: 0,
                    nightHours: 0,
                    saturdayHours: 0,
                    shifts: []
                };
            }
            
            if (log.action === 'Вход') {
                if (!empSessions[log.empId]) empSessions[log.empId] = [];
                empSessions[log.empId].push({ in: log.dateTime, out: null, inManual: log.isManual });
            } else if (log.action === 'Выход') {
                if (empSessions[log.empId] && empSessions[log.empId].length > 0) {
                    const s = empSessions[log.empId];
                    if (!s[s.length-1].out) {
                        const inTime = s[s.length-1].in;
                        const outTime = log.dateTime;
                        s[s.length-1].out = outTime;
                        
                        const shiftDateKey = inTime.toISOString().split('T')[0];
                        
                        if (!empDaily[log.empId][shiftDateKey]) {
                            empDaily[log.empId][shiftDateKey] = {
                                name: empName,
                                isDeleted: isDeleted,
                                totalHours: 0, nightHours: 0, saturdayHours: 0, shifts: []
                            };
                        }
                        
                        const isManualShift = s[s.length-1].inManual || log.isManual;
                        const shiftStr = `${inTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})} - ${outTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})}${isManualShift ? '*' : ''}`;
                        empDaily[log.empId][shiftDateKey].shifts.push(shiftStr);

                        let diffHours = (outTime - inTime) / 3600000;
                        let deducted = false;
                        if (client.autoDeductLunch && diffHours >= 6) {
                            diffHours -= 0.5;
                            deducted = true;
                        }
                        
                        empDaily[log.empId][shiftDateKey].totalHours += diffHours;
                        
                        if (isSaturday(inTime) || isSaturday(outTime)) {
                            empDaily[log.empId][shiftDateKey].saturdayHours += diffHours;
                        }
                        
                        // Night hours overlap (using local timezone and individual worker shift if present)
                        const offsetMs = getLocalOffsetMs(inTime);
                        let mStart = new Date(inTime.getTime() + offsetMs);
                        let mOut = new Date(outTime.getTime() + offsetMs);

                        const actualShiftNs = (!isDeleted && log.geofence.shiftNightStart) ? log.geofence.shiftNightStart : (client.shiftNightStart || "22:00");
                        const actualShiftNe = (!isDeleted && log.geofence.shiftNightEnd) ? log.geofence.shiftNightEnd : (client.shiftNightEnd || "06:00");
                        const [nsStartH, nsStartM] = actualShiftNs.split(':').map(Number);
                        const [nsEndH, nsEndM] = actualShiftNe.split(':').map(Number);
                        const nsStart = nsStartH * 60 + nsStartM;
                        const nsEnd = nsEndH * 60 + nsEndM;

                        while(mStart < mOut) {
                            const time = mStart.getUTCHours() * 60 + mStart.getUTCMinutes();
                            let isNight = false;
                            if (nsStart <= nsEnd) isNight = (time >= nsStart && time < nsEnd);
                            else isNight = (time >= nsStart || time < nsEnd);
                            
                            if (isNight) empDaily[log.empId][shiftDateKey].nightHours += 1/60;
                            mStart.setUTCMinutes(mStart.getUTCMinutes() + 1);
                        }
                    }
                }
            }
        });

        // Close open sessions at the end of the logs traversal to show them in the report
        for (const empId in empSessions) {
            const s = empSessions[empId];
            if (s.length > 0 && !s[s.length-1].out) {
                const inTime = s[s.length-1].in;
                const shiftDateKey = inTime.toISOString().split('T')[0];
                const isManualShift = s[s.length-1].inManual;
                const shiftStr = `${inTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})} - В процессе${isManualShift ? '*' : ''}`;
                if (empDaily[empId] && empDaily[empId][shiftDateKey]) {
                    empDaily[empId][shiftDateKey].shifts.push(shiftStr);
                }
            }
        }

        // Flatten into a report
        const report = [];
        for (let empId in empDaily) {
            for (let dateKey in empDaily[empId]) {
                const data = empDaily[empId][dateKey];
                
                // Only include days with actual worked hours OR an open shift
                if (data.totalHours > 0 || data.shifts.length > 0) {
                    let overtime = 0;
                    if (data.totalHours > 9) {
                        overtime = data.totalHours - 9;
                    }
                    report.push({
                        empId,
                        date: dateKey,
                        name: data.name,
                        isDeleted: data.isDeleted,
                        times: data.shifts.join(', '),
                        totalHours: data.totalHours.toFixed(2),
                        nightHours: data.nightHours.toFixed(2),
                        saturdayHours: data.saturdayHours.toFixed(2),
                        overtimeHours: overtime.toFixed(2)
                    });
                }
            }
        }
        
        // Sort report by date then by empId
        report.sort((a, b) => a.date.localeCompare(b.date) || a.empId.localeCompare(b.empId));

        console.log("SENDING REPORT:", JSON.stringify(report, null, 2));

        res.json({ success: true, report });
    } catch(e) { console.error(e); res.status(500).json({ success: false, error: e.message }); }
});

// ==========================================
// WORKER (PWA) ROUTES
// ==========================================
app.get('/api/worker/geofence/:empId', async (req, res) => {
    try {
        const geofence = await prisma.geofence.findUnique({ where: { empId: req.params.empId }, include: { client: true } });
        if (!geofence) return res.status(404).json({ success: false, error: 'Работник не найден' });
        if (!geofence.client.isActive) return res.status(403).json({ success: false, error: 'Система заблокирована' });
        
        const lastLog = await prisma.log.findFirst({
            where: { empId: req.params.empId },
            orderBy: { dateTime: 'desc' }
        });

        res.json({
            success: true,
            name: geofence.empName,
            id: geofence.empId,
            foremanName: geofence.client.name,
            lat: geofence.lat,
            lng: geofence.lng,
            radius: geofence.radius,
            isMobile: geofence.isMobile,
            shifts: {
                mS: geofence.shiftMorningStart || geofence.client.shiftMorningStart,
                mE: geofence.shiftMorningEnd || geofence.client.shiftMorningEnd,
                eS: geofence.shiftEveningStart || geofence.client.shiftEveningStart,
                eE: geofence.shiftEveningEnd || geofence.client.shiftEveningEnd,
                nS: geofence.shiftNightStart || geofence.client.shiftNightStart,
                nE: geofence.shiftNightEnd || geofence.client.shiftNightEnd
            },
            lastLog: lastLog ? { action: lastLog.action, time: lastLog.dateTime } : null
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/worker/report/:empId', async (req, res) => {
    const { empId } = req.params;
    const { month } = req.query; // format YYYY-MM
    try {
        const gf = await prisma.geofence.findUnique({ where: { empId }, include: { client: true } });
        if (!gf) return res.status(404).json({ success: false, error: 'Работник не найден' });

        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const nextMonth = new Date(startDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const logs = await prisma.log.findMany({
            where: {
                empId,
                dateTime: { gte: startDate, lt: nextMonth }
            },
            orderBy: { dateTime: 'asc' }
        });

        const actualNightStart = gf.shiftNightStart || gf.client.shiftNightStart;
        const actualNightEnd = gf.shiftNightEnd || gf.client.shiftNightEnd;
        const [nStartH, nStartM] = actualNightStart.split(':').map(Number);
        const [nEndH, nEndM] = actualNightEnd.split(':').map(Number);

        let totalHours = 0;
        let nightHours = 0;
        let saturdayHours = 0;
        let dailyHours = {}; // map date 'YYYY-MM-DD' -> hours

        let currentIn = null;

        logs.forEach(log => {
            if (log.action === 'Вход') {
                currentIn = log.dateTime;
            } else if (log.action === 'Выход' && currentIn) {
                const out = log.dateTime;
                const durationHours = (out - currentIn) / 3600000;
                totalHours += durationHours;

                // Iterate by minute to calculate night/saturday in local time
                const offsetMs = getLocalOffsetMs(currentIn);
                let mStart = new Date(currentIn.getTime() + offsetMs);
                let mOut = new Date(out.getTime() + offsetMs);

                while (mStart < mOut) {
                    if (mStart.getUTCDay() === 6) saturdayHours += 1/60;

                    const time = mStart.getUTCHours() * 60 + mStart.getUTCMinutes();
                    const startT = nStartH * 60 + nStartM;
                    const endT = nEndH * 60 + nEndM;
                    let isNight = false;
                    if (startT <= endT) isNight = (time >= startT && time < endT);
                    else isNight = (time >= startT || time < endT);
                    
                    if (isNight) nightHours += 1/60;
                    
                    const dateKey = mStart.toISOString().split('T')[0];
                    if (!dailyHours[dateKey]) dailyHours[dateKey] = 0;
                    dailyHours[dateKey] += 1/60;

                    mStart.setUTCMinutes(mStart.getUTCMinutes() + 1);
                }
                currentIn = null;
            }
        });

        let overtimeHours = 0;
        for (let date in dailyHours) {
            if (dailyHours[date] > 9) {
                overtimeHours += (dailyHours[date] - 9);
            }
        }

        res.json({
            success: true,
            totalHours: totalHours.toFixed(2),
            nightHours: nightHours.toFixed(2),
            saturdayHours: saturdayHours.toFixed(2),
            overtimeHours: overtimeHours.toFixed(2),
            dailyData: dailyHours
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/worker/log', async (req, res) => {
    const { empId, action, lat, lng } = req.body;
    try {
        const gf = await prisma.geofence.findUnique({ where: { empId }, include: { client: true } });
        if (!gf) return res.status(404).json({ success: false, error: 'Работник не найден' });
        if (!gf.client.isActive) return res.status(403).json({ success: false, error: 'Система заблокирована' });

        // If not mobile, check geofence distance
        if (!gf.isMobile) {
            function getDist(lat1, lon1, lat2, lon2) {
                const R = 6371e3;
                const dLat = (lat2-lat1)*Math.PI/180;
                const dLon = (lon2-lon1)*Math.PI/180;
                const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            }
            if (!lat || !lng) return res.status(400).json({ success: false, error: 'Геолокация обязательна' });
            if (getDist(gf.lat, gf.lng, lat, lng) > gf.radius) {
                return res.status(403).json({ success: false, error: 'Вы вне зоны объекта!' });
            }
        }

        await prisma.log.create({
            data: {
                empId, action, lat, lng,
                clientId: gf.clientId,
                geofenceId: gf.id
            }
        });

        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ==========================================
// CRON: PUSH NOTIFICATIONS
// ==========================================
app.get('/api/cron/push', async (req, res) => {
    try {
        const now = new Date();
        const curTimeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        const workers = await prisma.geofence.findMany({
            include: { logs: { where: { dateTime: { gte: new Date(now.setHours(0,0,0,0)) } } } }
        });
        
        let sentCount = 0;
        for (const w of workers) {
            const starts = [w.shiftMorningStart, w.shiftEveningStart, w.shiftNightStart].filter(Boolean);
            if (starts.includes(curTimeStr)) {
                const clockedIn = w.logs.some(l => l.action === 'Вход');
                if (!clockedIn) {
                    const subs = await prisma.pushSubscription.findMany({ where: { empId: w.empId } });
                    for (const sub of subs) {
                        try {
                            await webpush.sendNotification({
                                endpoint: sub.endpoint,
                                keys: { p256dh: sub.p256dh, auth: sub.auth }
                            }, JSON.stringify({
                                title: 'Смена началась!',
                                body: 'Вы забыли нажать "Вход" в приложении.'
                            }));
                            sentCount++;
                        } catch(e) {
                            if (e.statusCode === 410) {
                                await prisma.pushSubscription.delete({ where: { id: sub.id } });
                            }
                        }
                    }
                }
            }
        }
        res.json({ success: true, sent: sentCount });
    } catch (e) {
        console.error("Cron Error:", e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, async () => {
        // Ensure default settings exist
        const settings = await prisma.saaSSettings.findFirst();
        if (!settings) {
            await prisma.saaSSettings.create({ data: {} });
        }
        console.log(`TimeTracker SaaS running on http://localhost:${PORT}`);
    });
}

module.exports = app;
