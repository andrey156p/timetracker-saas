const fs = require('fs');

let admin = fs.readFileSync('public/admin.js', 'utf8');

// 1. Fix translations
admin = admin.replace('tab_owner_billing: "Биллинг",', 'tab_owner_billing: "Биллинг", tab_owner_leads: "Заявки с сайта",');
admin = admin.replace('tab_owner_billing: "Billing Data",', 'tab_owner_billing: "Billing Data", tab_owner_leads: "Website Leads",');
admin = admin.replace('tab_owner_billing: "חיוב",', 'tab_owner_billing: "חיוב", tab_owner_leads: "לידים",');

// 2. Fix colors in renderTabs
// Look for:
// const icon = document.createElement('div');
// icon.className = "w-4 h-4 bg-blue-500 rounded-full mr-2 opacity-80 flex-shrink-0";
// if(userRole === 'owner') icon.classList.replace('bg-blue-500', 'bg-purple-500');

const tabColorsTarget = `        const icon = document.createElement('div');
        icon.className = "w-4 h-4 bg-blue-500 rounded-full mr-2 opacity-80 flex-shrink-0";
        if(userRole === 'owner') icon.classList.replace('bg-blue-500', 'bg-purple-500');`;

const tabColorsReplace = `        const icon = document.createElement('div');
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'];
        const colorClass = colors[tabs.indexOf(tab) % colors.length];
        icon.className = \`w-4 h-4 \${colorClass} rounded-full mr-2 opacity-80 flex-shrink-0\`;`;

if (admin.includes(tabColorsTarget)) {
    admin = admin.replace(tabColorsTarget, tabColorsReplace);
}

// 3. Add delete button and function
const oldRenderLeads = `        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">\${l.name}</h3>
                    <span class="text-xs text-gray-400">\${dateStr}</span>
                </div>`;

const newRenderLeads = `        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative">
            <button onclick="deleteLead('\${l.id}')" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1" title="Удалить">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
            <div class="pr-8">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">\${l.name}</h3>
                    <span class="text-xs text-gray-400 block mt-1">\${dateStr}</span>
                </div>`;

if (admin.includes(oldRenderLeads)) {
    admin = admin.replace(oldRenderLeads, newRenderLeads);
}

const deleteLeadFunc = `
async function deleteLead(id) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку? / Are you sure?')) return;
    try {
        const res = await fetch(\`\${API_URL}/admin/leads/\${id}\`, {
            method: 'DELETE', headers: authHeaders()
        });
        if(res.ok) {
            Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2000, icon: 'success', title: 'Удалено!' });
            renderOwnerLeads();
        }
    } catch(e) {}
}
`;

if (!admin.includes('async function deleteLead')) {
    admin += '\n' + deleteLeadFunc;
}

fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log("Patched admin.js with fix for tab title, colors, and delete lead button");
