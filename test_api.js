const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.geofence.findFirst().then(g => {
    console.log(g.empId);
    return fetch(`http://localhost:3000/api/worker/geofence/${g.empId}`)
        .then(r => r.json())
        .then(console.log);
}).finally(() => prisma.$disconnect());
