const fs = require('fs');
let data = fs.readFileSync('public/admin.js', 'utf8');

const targetHtmlRegex = /<div><label class="text-xs text-gray-500" data-i18n="lat">.*?<\/div>\s*<div><label class="text-xs text-gray-500" data-i18n="lng">.*?<\/div>\s*<button onclick="getMyLocation.*?<\/button>\s*<button onclick="fetchAddress.*?<\/button>\s*<div class="w-full"><\/div>\s*<div><label class="text-xs text-gray-500" data-i18n="address">.*?<\/div>/s;

const replacementHtml = `<input type="hidden" id="w-lat">
            <input type="hidden" id="w-lng">
            <div><label class="text-xs text-gray-500" data-i18n="address">Адрес / Поиск</label><input id="w-addr" class="border p-1 rounded w-64 bg-white" placeholder="Введите адрес..."></div>
            <button onclick="searchAddressCoords()" id="btn-search-addr" class="bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow">Найти координаты</button>
            <button onclick="getMyLocation()" class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-300" data-i18n="get_my_loc">Моя локация</button>`;

if (targetHtmlRegex.test(data)) {
    data = data.replace(targetHtmlRegex, replacementHtml);
    fs.writeFileSync('public/admin.js', data);
    console.log('Regex replace successful!');
} else {
    console.log('Regex did NOT match!');
}
