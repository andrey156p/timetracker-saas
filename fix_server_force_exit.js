const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const targetServerBlock = `
        // Add "Выход" log
        await prisma.log.create({
            data: {
                empId,
                geofenceId: geofence.id,
                action: 'Выход',
                isManual: true,
                dateTime: new Date()
            }
        });
`;

const replaceServerBlock = `
        // Add "Выход" log
        await prisma.log.create({
            data: {
                empId,
                geofenceId: geofence.id,
                clientId: req.user.clientId,
                action: 'Выход',
                isManual: true,
                dateTime: new Date()
            }
        });
`;

serverCode = serverCode.replace(targetServerBlock, replaceServerBlock);
fs.writeFileSync('server.js', serverCode, 'utf8');

console.log("Server patch complete");
