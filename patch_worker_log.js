const fs = require('fs');

// --- SERVER.JS PATCH ---
let serverCode = fs.readFileSync('server.js', 'utf8');

const targetServerBlock = `
        await prisma.log.create({
            data: {
                empId, action, lat, lng,
                clientId: gf.clientId,
                geofenceId: gf.id
            }
        });

        res.json({ success: true });
`;

const replaceServerBlock = `
        await prisma.log.create({
            data: {
                empId, action, lat, lng,
                clientId: gf.clientId,
                geofenceId: gf.id
            }
        });

        let todayHours = 0;
        if (action === 'Выход') {
            try {
                const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
                tzDate.setHours(0,0,0,0);
                
                const todayLogs = await prisma.log.findMany({
                    where: { empId, dateTime: { gte: tzDate } },
                    orderBy: { dateTime: 'asc' }
                });
                
                let lastIn = null;
                for (const l of todayLogs) {
                    if (l.action === 'Вход' || l.action === 'Авто-Продолжение') {
                        lastIn = l.dateTime;
                    } else if (l.action === 'Выход' || l.action === 'Авто-Пауза') {
                        if (lastIn) {
                            todayHours += (l.dateTime - lastIn) / 3600000;
                            lastIn = null;
                        }
                    }
                }
            } catch(err) { console.error("Err calculating todayHours", err); }
        }

        res.json({ success: true, todayHours });
`;

serverCode = serverCode.replace(targetServerBlock, replaceServerBlock);
fs.writeFileSync('server.js', serverCode, 'utf8');


// --- APP.HTML PATCH ---
let appCode = fs.readFileSync('public/app.html', 'utf8');

const targetAppBlock = `
                    } else {
                        const duration = formatDuration(new Date() - shiftStartTime);
                        shiftStartTime = null;
                        setBtnState(false);
                        Swal.fire({ icon: 'success', title: 'OK', text: i18n[currentLang].msg_out_success + duration, timer: 3000, showConfirmButton: false });
                    }
`;

const replaceAppBlock = `
                    } else {
                        const duration = r.todayHours ? r.todayHours.toFixed(2) : (formatDuration(new Date() - shiftStartTime));
                        shiftStartTime = null;
                        setBtnState(false);
                        
                        let finalMsg = i18n[currentLang].msg_out_success + duration;
                        if (currentLang === 'ru') {
                            finalMsg = \`Сегодня отработано: \${duration} часов. Спасибо за Ваше время!\`;
                        }
                        
                        Swal.fire({ icon: 'success', title: 'OK', text: finalMsg, timer: 6000, showConfirmButton: false });
                    }
`;

appCode = appCode.replace(targetAppBlock, replaceAppBlock);
fs.writeFileSync('public/app.html', appCode, 'utf8');

console.log("Worker log patch complete");
