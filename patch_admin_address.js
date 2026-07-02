const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

// HTML replacement
const oldAddressHtml = `<button onclick="fetchAddress()" class="bg-gray-200 text-xs px-2 py-1 rounded" data-i18n="geocode"></button>
            <div class="w-full"></div>
            <div><label class="text-xs text-gray-500" data-i18n="address"></label><input id="w-addr" class="border p-1 rounded w-64 bg-gray-50" readonly></div>`;

const newAddressHtml = `<button onclick="fetchAddress()" class="bg-gray-200 text-xs px-2 py-1 rounded" data-i18n="geocode"></button>
            <div class="w-full"></div>
            <div class="flex items-end gap-2 w-full">
                <div class="flex-grow max-w-sm"><label class="text-xs text-gray-500" data-i18n="search_addr">Поиск по адресу / Search Address</label><input id="w-search" class="border p-1 rounded w-full"></div>
                <button onclick="searchAddressCoords()" class="bg-indigo-100 text-indigo-700 text-xs px-2 py-1.5 rounded border border-indigo-300 font-bold" data-i18n="search_btn">Найти / Find</button>
            </div>
            <div class="w-full"></div>
            <div><label class="text-xs text-gray-500" data-i18n="address"></label><input id="w-addr" class="border p-1 rounded w-64 bg-gray-50" readonly></div>`;

admin = admin.replace(oldAddressHtml, newAddressHtml);

const jsToAdd = `
async function searchAddressCoords() {
    const query = document.getElementById('w-search').value;
    if (!query) return;
    document.getElementById('w-search').disabled = true;
    try {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}\`);
        const data = await res.json();
        if (data && data.length > 0) {
            document.getElementById('w-lat').value = parseFloat(data[0].lat).toFixed(6);
            document.getElementById('w-lng').value = parseFloat(data[0].lon).toFixed(6);
            document.getElementById('w-addr').value = data[0].display_name;
            Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2000, icon: 'success', title: 'Найдено!' });
        } else {
            showToast("Адрес не найден / Address not found", true);
        }
    } catch (e) {
        showToast("Ошибка поиска / Search Error", true);
    }
    document.getElementById('w-search').disabled = false;
}
`;

if (!admin.includes('searchAddressCoords')) {
    admin += '\n' + jsToAdd;
}

fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('patched admin.js');
