const {PrismaClient}=require('@prisma/client');
const p = new PrismaClient();
p.client.findMany({ 
    select: { 
        id: true, username: true, name: true, isActive: true, tariffMode: true, pricePerUser: true, pricePerHour: true, trialEndsAt: true,
        _count: { select: { foremen: true, geofences: true } }
    } 
}).then(c=>{console.log(JSON.stringify(c, null, 2)); p.$disconnect()}).catch(e => {console.error(e); p.$disconnect()});
