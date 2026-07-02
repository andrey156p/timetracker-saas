const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

const oldHtml = `            <div><label class="text-xs text-gray-500" data-i18n="lat"></label><input id="w-lat" class="border p-1 rounded w-24" onchange="fetchAddress()"></div>
            <div><label class="text-xs text-gray-500" data-i18n="lng"></label><input id="w-lng" class="border p-1 rounded w-24" onchange="fetchAddress()"></div>
            <button onclick="getMyLocation()" class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-300" data-i18n="get_my_loc"></button>
            <button onclick="fetchAddress()" class="bg-gray-200 text-xs px-2 py-1 rounded" data-i18n="geocode"></button>
            <div class="w-full"></div>
            <div><label class="text-xs text-gray-500" data-i18n="address"></label><input id="w-addr" class="border p-1 rounded w-64 bg-gray-50" readonly></div>
            <div><label class="text-xs text-gray-500" data-i18n="rad"></label><input id="w-rad" class="border p-1 rounded w-20" value="500"></div>`;

const newHtml = `            <input type="hidden" id="w-lat">
            <input type="hidden" id="w-lng">
            <div><label class="text-xs text-gray-500" data-i18n="address">Адрес</label><input id="w-addr" class="border p-1 rounded w-64 bg-white" placeholder="Введите адрес..."></div>
            <button onclick="searchAddressCoords()" id="btn-search-addr" class="bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow">Найти координаты</button>
            <button onclick="getMyLocation()" class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-300" data-i18n="get_my_loc"></button>
            <div><label class="text-xs text-gray-500" data-i18n="rad"></label><input id="w-rad" class="border p-1 rounded w-20" value="500"></div>`;

admin = admin.replace(oldHtml, newHtml);

const oldSearch = `async function searchAddressCoords() {
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
}`;

const newSearch = `async function searchAddressCoords() {
    const query = document.getElementById('w-addr').value;
    if (!query) return;
    const btn = document.getElementById('btn-search-addr');
    if(btn) btn.disabled = true;
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
    if(btn) btn.disabled = false;
}`;

admin = admin.replace(oldSearch, newSearch);

fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('patched admin UI address');
