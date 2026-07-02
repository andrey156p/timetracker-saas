const fs = require('fs');
const lines = fs.readFileSync('public/admin.js', 'utf8').split('\n');
console.log(lines.slice(730, 760).join('\n'));
