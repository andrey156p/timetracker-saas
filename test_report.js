const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.log.findMany({
        where: { clientId: '06560954-e528-4f41-99ea-9fca2353e0b3' },
        include: { geofence: true },
        orderBy: { dateTime: 'asc' }
    });

    const empDaily = {};
    const empSessions = {};
    const parseTime = (t) => { if(!t) return 0; const [h,m] = t.split(':'); return parseInt(h)*60 + parseInt(m); };
    const nsStart = parseTime("22:00");
    const nsEnd = parseTime("06:00");
    const isSaturday = (d) => d.getDay() === 6;

    logs.forEach(log => {
        const dateKey = log.dateTime.toISOString().split('T')[0];
        
        const isDeleted = !log.geofence;
        const empName = isDeleted ? '' : log.geofence.empName;
        
        if (!empDaily[log.empId]) empDaily[log.empId] = {};
        if (!empDaily[log.empId][dateKey]) {
            empDaily[log.empId][dateKey] = {
                name: empName, isDeleted: isDeleted, totalHours: 0, nightHours: 0, saturdayHours: 0, shifts: []
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

    const report = [];
    for (const empId in empDaily) {
        for (const dateKey in empDaily[empId]) {
            const dayData = empDaily[empId][dateKey];
            if(dayData.totalHours > 0 || dayData.shifts.length > 0) {
                report.push({ empId, name: dayData.name, date: dateKey, times: dayData.shifts.join(', '), totalHours: dayData.totalHours.toFixed(2) });
            }
        }
    }
    console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
