const fs = require('fs');

let admin = fs.readFileSync('public/admin.js', 'utf8');

// Add translation key
const tRU = `tab_owner_billing: "Биллинг / Оплаты",
        tab_owner_leads: "Заявки с сайта",`;
const tEN = `tab_owner_billing: "Billing / Payments",
        tab_owner_leads: "Website Leads",`;
const tHE = `tab_owner_billing: "חיוב / תשלומים",
        tab_owner_leads: "לידים",`;

admin = admin.replace('tab_owner_billing: "Биллинг / Оплаты",', tRU);
admin = admin.replace('tab_owner_billing: "Billing / Payments",', tEN);
admin = admin.replace('tab_owner_billing: "חיוב / תשלומים",', tHE);

// Add to ownerTabs
const ownerTabsStr = `const ownerTabs = [
    { id: 'owner-hierarchy', titleKey: 'tab_owner_hierarchy', url: 'timetracker.com/owner/hierarchy' },
    { id: 'owner-clients', titleKey: 'tab_owner_clients', url: 'timetracker.com/owner/clients' },
    { id: 'owner-leads', titleKey: 'tab_owner_leads', url: 'timetracker.com/owner/leads' },
    { id: 'owner-billing', titleKey: 'tab_owner_billing', url: 'timetracker.com/owner/billing' },
    { id: 'owner-pass', titleKey: 'tab_owner_pass', url: 'timetracker.com/owner/settings' }
];`;

admin = admin.replace(/const ownerTabs = \[[\s\S]*?\];/, ownerTabsStr);

// Add loadTab logic
admin = admin.replace(
    `else if (tabId === 'owner-pass') renderOwnerPassword();`,
    `else if (tabId === 'owner-pass') renderOwnerPassword();
    else if (tabId === 'owner-leads') renderOwnerLeads();`
);

// Add renderOwnerLeads function
const renderLeadsFunc = `
async function renderOwnerLeads() {
    const res = await fetch(\`\${API_URL}/admin/leads\`, { headers: authHeaders() });
    const r = await res.json();
    if(!r.success) return logout();
    
    let html = \`<h2 class="text-xl font-bold mb-4">\${i18n[currentLang].tab_owner_leads}</h2>\`;
    html += \`<div class="grid md:grid-cols-2 gap-4">\`;
    
    r.leads.forEach(l => {
        const dateStr = new Date(l.createdAt).toLocaleString();
        html += \`
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">\${l.name}</h3>
                    <span class="text-xs text-gray-400">\${dateStr}</span>
                </div>
                <div class="text-sm text-gray-600 mb-1"><strong>Company:</strong> \${l.company}</div>
                <div class="text-sm text-gray-600 mb-1"><strong>Email:</strong> \${l.email || '-'}</div>
                <div class="text-sm text-gray-600 mb-3"><strong>Phone:</strong> \${l.phone || '-'}</div>
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Comments / Notes</label>
                <textarea id="comment-\${l.id}" rows="2" class="w-full text-sm border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none">\${l.comment || ''}</textarea>
                <button onclick="saveLeadComment('\${l.id}')" class="mt-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-1.5 rounded text-sm transition">Save Comment</button>
            </div>
        </div>\`;
    });
    
    if(r.leads.length === 0) html += \`<div class="text-gray-500">No leads yet.</div>\`;
    
    html += \`</div>\`;
    document.getElementById('view-content').innerHTML = html;
}

async function saveLeadComment(id) {
    const comment = document.getElementById('comment-' + id).value;
    try {
        const res = await fetch(\`\${API_URL}/admin/leads/\${id}/comment\`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ comment })
        });
        if(res.ok) {
            Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2000, icon: 'success', title: 'Saved!' });
        }
    } catch(e) {}
}
`;

if (!admin.includes('async function renderOwnerLeads')) {
    admin += '\n' + renderLeadsFunc;
    fs.writeFileSync('public/admin.js', admin, 'utf8');
    console.log("Patched admin.js with leads logic");
} else {
    console.log("admin.js already has leads logic");
}
