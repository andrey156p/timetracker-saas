const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const start = s.indexOf("app.post('/api/worker/log'");
console.log(s.substring(start, start + 2500));
