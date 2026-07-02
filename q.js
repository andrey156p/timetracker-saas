const {PrismaClient}=require('@prisma/client');
const p = new PrismaClient();
p.client.findMany().then(c=>{console.log(c); p.$disconnect()});
