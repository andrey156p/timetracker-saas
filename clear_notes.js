const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearNotes() {
    await prisma.dailyNote.deleteMany();
    console.log('All notes deleted.');
}

clearNotes().catch(console.error).finally(() => prisma.$disconnect());
