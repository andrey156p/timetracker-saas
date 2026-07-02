const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const targetServerBlock = `
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
`;

const replaceServerBlock = `
        let isOutZone = false;
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
                if (action === 'Выход') {
                    isOutZone = true; // Allow clock out, but remember they are out of zone
                } else {
                    return res.status(403).json({ success: false, error: 'Вы вне зоны объекта!' });
                }
            }
        }
`;

serverCode = serverCode.replace(targetServerBlock, replaceServerBlock);

const targetLogBlock = `
        let todayHours = 0;
        if (action === 'Выход') {
`;

const replaceLogBlock = `
        let todayHours = 0;
        if (action === 'Выход') {
            // Check if we need to add a note
            let notesToAdd = [];
            if (isOutZone) {
                notesToAdd.push('Закрыл смену вне рабочей зоны');
            }
            
            // Check if closed later than schedule
            const now = new Date();
            const curTimeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
            const ends = [gf.shiftMorningEnd, gf.shiftEveningEnd, gf.shiftNightEnd].filter(Boolean);
            if (ends.length > 0) {
                // If the current time is strictly greater than the latest end time by more than say, 30 minutes?
                // Or just if it's greater. The user said "позже окончания своей указанной смены".
                // Let's just find if curTimeStr is greater than the latest shift end.
                // Assuming shifts don't cross midnight, or if they do, it's complex. Let's just do a basic string comparison.
                let latestEnd = ends.sort().reverse()[0];
                if (curTimeStr > latestEnd) {
                    notesToAdd.push('Закрыл смену позже графика');
                }
            }

            if (notesToAdd.length > 0) {
                try {
                    const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
                    const dateStr = tzDate.getFullYear() + '-' + String(tzDate.getMonth()+1).padStart(2,'0') + '-' + String(tzDate.getDate()).padStart(2,'0');
                    const noteText = '(' + notesToAdd.join(', ') + ')';
                    const existingNote = await prisma.dailyNote.findFirst({
                        where: { clientId: gf.clientId, empId, dateStr }
                    });
                    if (existingNote) {
                        if (!existingNote.note.includes(noteText)) {
                            await prisma.dailyNote.update({
                                where: { id: existingNote.id },
                                data: { note: existingNote.note + ' ' + noteText }
                            });
                        }
                    } else {
                        await prisma.dailyNote.create({
                            data: { clientId: gf.clientId, empId, dateStr, note: noteText }
                        });
                    }
                } catch(err) { console.error("Err adding daily note", err); }
            }

`;

serverCode = serverCode.replace(targetLogBlock, replaceLogBlock);

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log("Patch 2 complete");
