const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

const targetEndpoint = `app.get('/api/admin/clients', authOwner, async (req, res) => {`;
const replaceWith = `
app.get('/api/admin/leads', authOwner, async (req, res) => {
    try {
        const leads = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({ success: true, leads });
    } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/admin/leads/:id/comment', authOwner, async (req, res) => {
    try {
        await prisma.contactRequest.update({
            where: { id: req.params.id },
            data: { comment: req.body.comment }
        });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/admin/clients', authOwner, async (req, res) => {`;

if (!server.includes('/api/admin/leads')) {
    server = server.replace(targetEndpoint, replaceWith);
    fs.writeFileSync('server.js', server, 'utf8');
    console.log("Patched server.js with leads endpoints");
} else {
    console.log("Leads endpoints already in server.js");
}
