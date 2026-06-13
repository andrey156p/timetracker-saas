const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const logs = await prisma.log.findMany({
        where: { clientId: '360a1a6e-79aa-4010-ae99-9eff834db7c7' },
        include: { geofence: true },
        orderBy: { dateTime: 'asc' }
    });
    const parseTime = (t) => { if(!t) return 0; const [h,m] = t.split(':'); return parseInt(h)*60 + parseInt(m); };
    const nsStart = parseTime('22:00');
    const nsEnd = parseTime('06:00');
    const isSaturday = (d) => d.getDay() === 6;
    const empDaily = {};
    const empSessions = {};
    logs.forEach(log => {
        const dateKey = log.dateTime.toISOString().split('T')[0];
        const isDeleted = !log.geofence;
        const empName = isDeleted ? '' : log.geofence.empName;
        if (!empDaily[log.empId]) empDaily[log.empId] = {};
        if (!empDaily[log.empId][dateKey]) {
            empDaily[log.empId][dateKey] = {
                name: empName,
                isDeleted: isDeleted,
                totalHours: 0, nightHours: 0, saturdayHours: 0, shifts: []
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
                            name: empName, isDeleted: isDeleted, totalHours: 0, nightHours: 0, saturdayHours: 0, shifts: []
                        };
                    }
                    const shiftStr = `${inTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})} - ${outTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem'})}`;
                    empDaily[log.empId][shiftDateKey].shifts.push(shiftStr);
                    const diffHours = (outTime - inTime) / 3600000;
                    empDaily[log.empId][shiftDateKey].totalHours += diffHours;
                }
            }
        }
    });
    const report = [];
    for (let empId in empDaily) {
        for (let dateKey in empDaily[empId]) {
            const data = empDaily[empId][dateKey];
            if (data.totalHours > 0) {
                report.push({
                    empId, date: dateKey, times: data.shifts.join(', '), totalHours: data.totalHours.toFixed(2)
                });
            }
        }
    }
    console.log(JSON.stringify(report, null, 2));
}
main();
