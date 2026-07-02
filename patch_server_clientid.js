const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const oldCheck = `const clientIdToCheck = decoded.role === 'client' ? decoded.id : decoded.clientId;`;
const newCheck = `const clientIdToCheck = decoded.clientId;`;

if (server.includes(oldCheck)) {
    server = server.replace(oldCheck, newCheck);
    fs.writeFileSync('server.js', server, 'utf8');
    console.log("Patched server.js: clientIdToCheck = decoded.clientId");
} else {
    console.log("oldCheck not found in server.js");
}
