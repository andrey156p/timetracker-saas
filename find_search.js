const fs = require('fs');
const lines = fs.readFileSync('public/admin.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('employees-list') || l.includes('workers-table') || l.includes('tab_client_workers')) {
        console.log(i + 1, l);
    }
});
