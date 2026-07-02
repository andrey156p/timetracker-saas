const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');
admin = admin.replace(/\.toLocaleDateString\(\)/g, `.toLocaleDateString('en-GB')`);
admin = admin.replace(/\.toLocaleString\(\)/g, `.toLocaleString('en-GB')`);
fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('Fixed dates in admin.js');
