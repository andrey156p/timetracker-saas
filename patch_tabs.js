const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

const oldTabs = `const ownerTabs = [
    { id: 'owner-hierarchy', titleKey: 'tab_owner_hierarchy', url: 'timetracker.com/owner/hierarchy' },
    { id: 'owner-clients', titleKey: 'tab_owner_clients', url: 'timetracker.com/owner/clients' },
    { id: 'owner-leads', titleKey: 'tab_owner_leads', url: 'timetracker.com/owner/leads' },
    { id: 'owner-billing', titleKey: 'tab_owner_billing', url: 'timetracker.com/owner/billing' },
    { id: 'owner-pass', titleKey: 'tab_owner_pass', url: 'timetracker.com/owner/settings' }
];`;

const newTabs = `const ownerTabs = [
    { id: 'owner-hierarchy', titleKey: 'tab_owner_hierarchy', url: 'timetracker.com/owner/hierarchy' },
    { id: 'owner-clients', titleKey: 'tab_owner_clients', url: 'timetracker.com/owner/clients' },
    { id: 'owner-leads', titleKey: 'tab_owner_leads', url: 'timetracker.com/owner/leads' },
    { id: 'owner-billing', titleKey: 'tab_owner_billing', url: 'timetracker.com/owner/billing' },
    { id: 'owner-invoices', titleKey: 'tab_owner_invoices', url: 'timetracker.com/owner/invoices' },
    { id: 'owner-pass', titleKey: 'tab_owner_pass', url: 'timetracker.com/owner/settings' }
];`;

admin = admin.replace(oldTabs, newTabs);
fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('patched ownerTabs in admin.js');
