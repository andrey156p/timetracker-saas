const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

const deleteEndpoint = `
app.delete('/api/admin/leads/:id', authOwner, async (req, res) => {
    try {
        await prisma.contactRequest.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});
`;

if (!server.includes('app.delete(\'/api/admin/leads/:id\'')) {
    server = server.replace(`app.get('/api/admin/clients', authOwner, async (req, res) => {`, deleteEndpoint + `\napp.get('/api/admin/clients', authOwner, async (req, res) => {`);
    fs.writeFileSync('server.js', server, 'utf8');
    console.log("Patched server.js with DELETE endpoint for leads");
} else {
    console.log("DELETE endpoint already exists in server.js");
}
