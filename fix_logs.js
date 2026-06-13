const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLogs() {
    console.log('Fetching logs with null geofenceId...');
    const logs = await prisma.log.findMany({
        where: { geofenceId: null }
    });

    console.log(`Found ${logs.length} logs to fix.`);

    let fixedCount = 0;
    for (const log of logs) {
        const gf = await prisma.geofence.findFirst({
            where: {
                empId: log.empId,
                clientId: log.clientId
            }
        });

        if (gf) {
            await prisma.log.update({
                where: { id: log.id },
                data: { geofenceId: gf.id }
            });
            fixedCount++;
        }
    }

    console.log(`Successfully fixed ${fixedCount} logs.`);
}

fixLogs().catch(e => console.error(e)).finally(() => prisma.$disconnect());
