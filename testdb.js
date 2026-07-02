const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const marina = await prisma.client.findUnique({ where: { username: 'marina' } });
    console.log('Marina:', marina);
}

main().catch(console.error).finally(()=>prisma.$disconnect());
