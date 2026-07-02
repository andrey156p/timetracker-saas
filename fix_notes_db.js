const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNotes() {
    const notes = await prisma.dailyNote.findMany();
    for (const note of notes) {
        let newText = note.noteText;
        
        // Russian
        newText = newText.replace(/Расходы \/ Заметки/g, 'Сумма');
        
        // English
        newText = newText.replace(/Expenses \/ Notes/g, 'Amount');
        
        // Hebrew
        newText = newText.replace(/הוצאות \/ הערות/g, 'סכום');
        
        // Arabic
        newText = newText.replace(/مصاريف \/ ملاحظات/g, 'المبلغ');
        
        if (newText !== note.noteText) {
            await prisma.dailyNote.update({
                where: { id: note.id },
                data: { noteText: newText }
            });
            console.log(`Updated note ${note.id}`);
        }
    }
    console.log('Done cleaning notes');
}

fixNotes().catch(console.error).finally(() => prisma.$disconnect());
