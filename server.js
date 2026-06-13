const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'SUPER_SECRET_TOKEN_V2';
let OWNER_PASSWORD = 'SuperOwner999';

// Static files
app.use(express.static(path.join(__dirname)));

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
        if (decoded.role !== 'client') throw new Error();
        req.user = decoded;
        next();
    } catch(e) { res.status(403).json({ success: false, error: 'Доступ запрещен' }); }
}

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Check Owner
    if (username === 'owner' && password === OWNER_PASSWORD) {
        const token = jwt.sign({ role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, role: 'owner', token });
    }

    // Check Client (Foreman)
    const client = await prisma.client.findUnique({ where: { username } });
    if (client && client.password === password) {
        if (!client.isActive) return res.status(403).json({ success: false, error: 'Ваш аккаунт заблокирован за неуплату' });
        const token = jwt.sign({ role: 'client', clientId: client.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, role: 'client', token, clientId: client.id });
    }

    res.status(401).json({ success: false, error: 'Неверные учетные данные' });
});

// ==========================================
// OWNER ROUTES
// ==========================================
app.post('/api/admin/password', authOwner, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword !== OWNER_PASSWORD) return res.status(403).json({ success: false, error: 'Неверный старый пароль' });
    if (!newPassword) return res.status(400).json({ success: false, error: 'Пароль пуст' });
    OWNER_PASSWORD = newPassword;
    res.json({ success: true });
});

app.get('/api/admin/clients', authOwner, async (req, res) => {
    const clients = await prisma.client.findMany({ select: { id: true, username: true, name: true, isActive: true, tariffMode: true, pricePerUser: true, pricePerHour: true } });
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
                cost = client.geofences.length * client.pricePerUser;
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
app.get('/api/client/employees', authClient, async (req, res) => {
    const employees = await prisma.geofence.findMany({ where: { clientId: req.user.clientId } });
    res.json({ success: true, employees });
});

app.post('/api/client/employees', authClient, async (req, res) => {
    const { empId, empName, lat, lng, radius, isMobile } = req.body;
    try {
        await prisma.geofence.create({
            data: {
                clientId: req.user.clientId,
                empId, empName, lat: parseFloat(lat)||0, lng: parseFloat(lng)||0, radius: parseFloat(radius)||0, isMobile: !!isMobile
            }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: 'Работник с таким ID уже существует' });
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

app.post('/api/client/settings', authClient, async (req, res) => {
    const { shiftMorningStart, shiftMorningEnd, shiftEveningStart, shiftEveningEnd, shiftNightStart, shiftNightEnd } = req.body;
    await prisma.client.update({
        where: { id: req.user.clientId },
        data: { shiftMorningStart, shiftMorningEnd, shiftEveningStart, shiftEveningEnd, shiftNightStart, shiftNightEnd }
    });
    res.json({ success: true });
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
                }
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
                empSessions[log.empId].push({ in: log.dateTime, out: null });
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
                        
                        const shiftStr = `${inTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})} - ${outTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})}`;
                        empDaily[log.empId][shiftDateKey].shifts.push(shiftStr);

                        const diffHours = (outTime - inTime) / 3600000;
                        empDaily[log.empId][shiftDateKey].totalHours += diffHours;
                        
                        if (isSaturday(inTime) || isSaturday(outTime)) {
                            empDaily[log.empId][shiftDateKey].saturdayHours += diffHours;
                        }
                        
                        // Night hours overlap (using midpoint heuristic)
                        const midTime = new Date((inTime.getTime() + outTime.getTime()) / 2);
                        const midMins = midTime.getHours() * 60 + midTime.getMinutes();
                        let isNight = false;
                        if (nsStart > nsEnd) {
                            if (midMins >= nsStart || midMins <= nsEnd) isNight = true;
                        } else {
                            if (midMins >= nsStart && midMins <= nsEnd) isNight = true;
                        }
                        if (isNight) empDaily[log.empId][shiftDateKey].nightHours += diffHours;
                    }
                }
            }
        });

        // Flatten into a report
        const report = [];
        for (let empId in empDaily) {
            for (let dateKey in empDaily[empId]) {
                const data = empDaily[empId][dateKey];
                
                // Only include days with actual worked hours
                if (data.totalHours > 0) {
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

        const [nStartH, nStartM] = gf.client.shiftNightStart.split(':').map(Number);
        const [nEndH, nEndM] = gf.client.shiftNightEnd.split(':').map(Number);

        function isNightMinute(date) {
            const h = date.getHours();
            const m = date.getMinutes();
            const time = h * 60 + m;
            const startT = nStartH * 60 + nStartM;
            const endT = nEndH * 60 + nEndM;
            if (startT <= endT) {
                return time >= startT && time < endT;
            } else {
                return time >= startT || time < endT; // crosses midnight
            }
        }

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

                // Iterate by minute to calculate night/saturday
                let mStart = new Date(currentIn);
                while (mStart < out) {
                    if (mStart.getDay() === 6) saturdayHours += 1/60;
                    if (isNightMinute(mStart)) nightHours += 1/60;
                    
                    const dateKey = mStart.toISOString().split('T')[0];
                    if (!dailyHours[dateKey]) dailyHours[dateKey] = 0;
                    dailyHours[dateKey] += 1/60;

                    mStart.setMinutes(mStart.getMinutes() + 1);
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

const PORT = 3000;
app.listen(PORT, async () => {
    // Ensure default settings exist
    const settings = await prisma.saaSSettings.findFirst();
    if (!settings) {
        await prisma.saaSSettings.create({ data: {} });
    }
    console.log(`TimeTracker SaaS running on http://localhost:${PORT}`);
});
