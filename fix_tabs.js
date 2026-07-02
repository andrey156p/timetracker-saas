const fs = require('fs');
let data = fs.readFileSync('public/admin.js', 'utf8');
let lines = data.split(/\r?\n/);

// Remove all occurrences of the bad injection
lines = lines.filter(l => !l.includes("{ id: 'owner-invoices'"));

// Find the right place
let injected = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("id: 'owner-billing'") && lines[i].includes('tab_owner_billing')) {
        lines.splice(i + 1, 0, "    { id: 'owner-invoices', titleKey: 'tab_owner_invoices', url: 'timetracker.com/owner/invoices' },");
        injected = true;
        break;
    }
}

if (injected) {
    fs.writeFileSync('public/admin.js', lines.join('\n'));
    console.log('Fixed and injected successfully!');
} else {
    console.log('Failed to find owner-billing in ownerTabs array!');
}
