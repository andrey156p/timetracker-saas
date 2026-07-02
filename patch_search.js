const fs = require('fs');

let adminJs = fs.readFileSync('public/admin.js', 'utf8');

const targetHtml = `
    <h3 class="font-bold mb-2" data-i18n="tab_client_workers"></h3>
    <div class="overflow-x-auto w-full pb-2"><table class="w-full text-left border-collapse bg-white shadow rounded">
`;

const replaceHtml = `
    <div class="flex flex-wrap justify-between items-center mb-2 gap-2">
        <h3 class="font-bold" data-i18n="tab_client_workers"></h3>
        <input type="text" oninput="filterWorkersList(this.value)" placeholder="Поиск (Имя, ID)..." class="border p-2 rounded text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400">
    </div>
    <div class="overflow-x-auto w-full pb-2"><table class="w-full text-left border-collapse bg-white shadow rounded">
`;

adminJs = adminJs.replace(targetHtml, replaceHtml);

const filterFunc = `
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

if (!adminJs.includes('function filterWorkersList')) {
    adminJs += '\n' + filterFunc;
}

fs.writeFileSync('public/admin.js', adminJs, 'utf8');
console.log('Search patch applied');
