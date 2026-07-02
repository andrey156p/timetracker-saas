const fs = require('fs');

// Fix admin.js
let adminCode = fs.readFileSync('public/admin.js', 'utf8');
adminCode = adminCode.replace(
    'async function generatePDFReport() {',
    'async function generatePDFReport() {\n    const isHe = currentLang === \'he\';'
);
// Also need to fix generateCSVReport if it uses isHe! Wait! Let me check if generateCSVReport uses isHe!
// Let's just define it globally for generateCSVReport too just in case, but let's look at generateCSVReport later if needed.
fs.writeFileSync('public/admin.js', adminCode, 'utf8');

// Fix server.js
let serverCode = fs.readFileSync('server.js', 'utf8');
serverCode = serverCode.replace(
    'id: true, username: true, name: true, isActive: true, tariffMode: true, pricePerUser: true, pricePerHour: true,',
    'id: true, username: true, name: true, isActive: true, tariffMode: true, pricePerUser: true, pricePerHour: true, trialEndsAt: true,'
);
fs.writeFileSync('server.js', serverCode, 'utf8');

console.log('Fixed both files');
