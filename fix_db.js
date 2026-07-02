const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNotes() {
    try {
        const notes = await prisma.dailyNote.findMany();
        let updated = 0;
        for (let n of notes) {
            if (n.noteText && (n.noteText.includes('Смена прервана руководителем') || n.noteText.includes('Закрыл смену вне рабочей зоны') || n.noteText.includes('Закрыл смену позже графика'))) {
                let newText = n.noteText;
                newText = newText.replace(/Смена прервана руководителем/g, 'Shift terminated by manager');
                newText = newText.replace(/Закрыл смену вне рабочей зоны/g, 'Closed shift outside work zone');
                newText = newText.replace(/Закрыл смену позже графика/g, 'Closed shift later than schedule');
                
                await prisma.dailyNote.update({
                    where: { id: n.id },
                    data: { noteText: newText }
                });
                updated++;
            }
        }
        console.log(`Updated ${updated} existing notes in DB.`);
    } catch (e) {
        console.error("DB fix error", e);
    } finally {
        await prisma.$disconnect();
    }
}

fixNotes();
