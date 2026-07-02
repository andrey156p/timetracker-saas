const fs = require('fs');
let data = fs.readFileSync('public/admin.js', 'utf8');
const lines = data.split(/\r?\n/);
let injected = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('tab_owner_billing') && !lines[i+1].includes('tab_owner_invoices')) {
        lines.splice(i + 1, 0, "    { id: 'owner-invoices', titleKey: 'tab_owner_invoices', url: 'timetracker.com/owner/invoices' },");
        injected = true;
        break;
    }
}
if (injected) {
    fs.writeFileSync('public/admin.js', lines.join('\n'));
    console.log('Successfully injected owner-invoices tab.');
} else {
    console.log('Could not find injection point or it is already there.');
}
