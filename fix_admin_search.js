const fs = require('fs');

let adminJs = fs.readFileSync('public/admin.js', 'utf8');

const targetStr = '<h3 class="font-bold mb-2" data-i18n="tab_client_workers"></h3>';
const replaceStr = `
    <div class="flex flex-wrap justify-between items-center mb-2 gap-2">
        <h3 class="font-bold" data-i18n="tab_client_workers"></h3>
        <input type="text" oninput="filterWorkersList(this.value)" placeholder="Поиск (Имя, ID, Бригадир)..." class="border p-2 rounded text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400">
    </div>
`;

if (adminJs.includes(targetStr)) {
    adminJs = adminJs.replace(targetStr, replaceStr);
    console.log("Replaced target string");
} else {
    console.log("Target string NOT found");
}

if (!adminJs.includes('window.filterWorkersList = function')) {
    adminJs += `
window.filterWorkersList = function(query) {
    if (!query) query = '';
    query = query.toLowerCase();
    const rows = document.querySelectorAll('#workers-list tr');
    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        if (text.includes(query)) {
            r.style.display = '';
        } else {
            r.style.display = 'none';
        }
    });
};
`;
    console.log("Added filterWorkersList function");
}

fs.writeFileSync('public/admin.js', adminJs, 'utf8');
console.log("admin.js patched successfully");
