const API_URL = '/api';

function showToast(msg, isError=false){
    if(typeof Swal !== 'undefined'){
        Swal.fire({
            toast:true, 
            position:'top-end', 
            showConfirmButton:false, 
            timer:3000, 
            title:msg, 
            icon:isError?'error':'info'
        });
    } else {
        alert(msg);
    }
}


const i18n = {
    ru: {
        username: "Логин", password: "Пароль", login_btn: "Войти", logout: "Выйти",
        tab_owner_clients: "Управление руководителями", tab_owner_billing: "Биллинг", tab_owner_invoices: "Счета", tab_owner_pass: "Смена пароля",
        tab_client_workers: "Работники", tab_client_shifts: "Смены",
        add_foreman: "Создать руководителя", foreman_name: "Имя/Название", foreman_login: "Логин", foreman_pass: "Пароль",
        save: "Сохранить", action: "Действие", block: "Заблокировать", unblock: "Разблокировать",
        period: "Период", from: "От", to: "До", load: "Загрузить", clear_btn: "Сброс", all_workers: "Все работники",
        workers: "Работников", hours: "Всего Часов", active: "Активен", old_pass: "Старый пароль", new_pass: "Новый пароль",
        add_worker: "Добавить работника", worker_name: "Имя", lat: "Широта (GPS)", lng: "Долгота (GPS)", rad: "Радиус (м)",
        mobile: "Передвижной (без GPS)", link: "Уникальная ссылка работников:", copy: "Копировать", delete: "Удалить",
        geocode: "Узнать адрес", address: "Адрес (Город, Улица)", get_my_loc: "Моя геопозиция",
        matrix_title: "Матрица расписания смен (на неделю)", global_shifts: "Настройка времени смен (Глобально)",
        morning: "Утро", evening: "Вечер", night: "Ночь",
        d_sun: "Вс", d_mon: "Пн", d_tue: "Вт", d_wed: "Ср", d_thu: "Чт", d_fri: "Пт", d_sat: "Сб",
        off: "- Вых -", hours_worked: "Часы отработанные работниками", choose_period: "Выберите период...", no_workers: "Нет работников", loading: "Загрузка...",
        date: "Дата", id: "ID", night_hours: "Ночные", saturday_hours: "Суббота", overtime_hours: "Сверхурочные", deleted_worker: "Удаленный работник", total_sum_hours: "Всего часов за период:", download_report: "Скачать Отчёт (Excel)", shift_times: "Вход/Выход",
        status: "Статус", print: "Печать", paid: "ОПЛАЧЕН", pending: "ОЖИДАЕТ",
        invoices_title: "Выставленные счета (Invoices)", amount: "Сумма",
        qr_print: "QR / Печать", copy_link: "Копировать линк", reset_pass: "Пароль", tariff: "Тариф",
        per_hour: "За час", per_worker: "За работника в день", block_btn: "Блок", unblock_btn: "Разблок", copied: "Скопировано!",
        qr_scan_text: "Отсканируйте этот код камерой вашего телефона для установки приложения учета времени.",
        edit: "Изменить", indiv_shifts: "Индивидуальные смены (пусто = глобальные)", save_changes: "Сохранить изменения", cancel: "Отмена"
    },
    en: {
        username: "Username", password: "Password", login_btn: "Login", logout: "Logout",
        login_title: "Welcome", login_subtitle: "Enter your details to login", login_desc: "Time tracking for your business",
        tab_owner_clients: "Managers", tab_owner_billing: "Billing Data", tab_owner_invoices: "Invoices", tab_owner_pass: "Change Password",
        tab_client_workers: "Workers", tab_client_shifts: "Shifts",
        add_foreman: "Create Manager", foreman_name: "Name", foreman_login: "Login", foreman_pass: "Password",
        save: "Save", action: "Action", block: "Block", unblock: "Unblock",
        period: "Period", from: "From", to: "To", load: "Load", clear_btn: "Reset", all_workers: "All workers",
        workers: "Workers", hours: "Total Hours", active: "Active", old_pass: "Old Password", new_pass: "New Password",
        add_worker: "Add Worker", worker_name: "Name", lat: "Latitude", lng: "Longitude", rad: "Radius (m)",
        mobile: "Mobile (No GPS)", link: "Workers unique link:", copy: "Copy", delete: "Delete",
        geocode: "Get Address", address: "Address", get_my_loc: "My Location",
        matrix_title: "Shift Schedule Matrix (Weekly)", global_shifts: "Global Shift Times",
        morning: "Morning", evening: "Evening", night: "Night",
        d_sun: "Sun", d_mon: "Mon", d_tue: "Tue", d_wed: "Wed", d_thu: "Thu", d_fri: "Fri", d_sat: "Sat",
        off: "- Off -", hours_worked: "Hours worked by employees", choose_period: "Select period...", no_workers: "No workers", loading: "Loading...",
        date: "Date", id: "ID", night_hours: "Night", saturday_hours: "Saturday", overtime_hours: "Overtime", deleted_worker: "Deleted Worker", total_sum_hours: "Total hours for period:", download_report: "Download Report (Excel)", shift_times: "In/Out",
        status: "Status", print: "Print", paid: "PAID", pending: "PENDING",
        invoices_title: "Invoices", amount: "Amount",
        qr_print: "QR / Print", copy_link: "Copy Link", reset_pass: "Password", tariff: "Tariff",
        qr_print: "QR / Print", copy_link: "Copy Link", reset_pass: "Password", tariff: "Tariff",
        per_hour: "Per hour", per_worker: "Per worker (daily)", block_btn: "Block", unblock_btn: "Unblock", copied: "Copied!",
        qr_scan_text: "Scan this code with your phone camera to install the time tracking app.",
        edit: "Edit", indiv_shifts: "Individual Shifts (empty = global)", save_changes: "Save Changes", cancel: "Cancel"
    },
    he: {
        username: "שם משתמש", password: "סיסמה", login_btn: "התחבר", logout: "התנתק",
        login_title: "ברוך הבא", login_subtitle: "הזן את הפרטים שלך כדי להתחבר", login_desc: "מעקב אחר זמן לעסק שלך",
        tab_owner_clients: "ניהול מנהלי עבודה", tab_owner_billing: "חיוב", tab_owner_invoices: "חשבונות", tab_owner_pass: "שינוי סיסמה",
        tab_client_workers: "עובדים", tab_client_shifts: "משמרות",
        add_foreman: "צור מנהל עבודה", foreman_name: "שם", foreman_login: "שם משתמש", foreman_pass: "סיסמה",
        save: "שמור", action: "פעולה", block: "חסום", unblock: "בטל חסימה",
        period: "תקופה", from: "מ-", to: "עד-", load: "טען", clear_btn: "נקה נתונים", all_workers: "כל העובדים",
        workers: "עובדים", hours: "סה\"כ שעות", active: "פעיל", old_pass: "סיסמה ישנה", new_pass: "סיסמה חדשה",
        add_worker: "הוסף עובד", worker_name: "שם", lat: "קו רוחב", lng: "קו אורך", rad: "רדיוס",
        mobile: "נייד (ללא GPS)", link: "קישור ייחודי לעובדים:", copy: "העתק", delete: "מחק",
        geocode: "קבל כתובת", address: "כתובת", get_my_loc: "המיקום שלי",
        matrix_title: "מטריצת משמרות (שבועית)", global_shifts: "הגדרת זמני משמרות (גלובלי)",
        morning: "בוקר", evening: "ערב", night: "לילה",
        d_sun: "א'", d_mon: "ב'", d_tue: "ג'", d_wed: "ד'", d_thu: "ה'", d_fri: "ו'", d_sat: "ש'",
        off: "- חופש -", hours_worked: "שעות עבודה של עובדים", choose_period: "בחר תקופה...", no_workers: "אין עובדים", loading: "טוען...",
        date: "תאריך", id: "מס' עובד", night_hours: "לילה", saturday_hours: "שבת", overtime_hours: "שעות נוספות", deleted_worker: "עובד שנמחק",
        status: "סטטוס",
        action: "פעולה",
        print: "הדפס",
        delete: "מחק",
        paid: "שולם",
        pending: "ממתין",
        total_sum_hours: "סה\"כ שעות לתקופה זו:",
        download_report: "הורד דוח (Excel)",
        shift_times: "כניסה/יציאה",
        qr_print: "QR / הדפס", copy_link: "העתק קישור", reset_pass: "סיסמה", tariff: "תעריף",
        per_hour: "לשעה", per_worker: "לעובד ליום", block_btn: "חסום", unblock_btn: "שחרר", copied: "הועתק!",
        qr_scan_text: "סרוק קוד זה במצלמת הטלפון שלך כדי להתקין את אפליקציית מעקב הזמן.",
        edit: "ערוך", indiv_shifts: "משמרות אישיות (ריק = גלובלי)", save_changes: "שמור שינויים", cancel: "ביטול"
    }
};

let currentLang = 'en';
const browserLang = (navigator.language || navigator.userLanguage || 'he').toLowerCase();
if (browserLang.startsWith('ru') || browserLang.startsWith('uk') || browserLang.startsWith('be')) {
    currentLang = 'ru';
} else if (browserLang.startsWith('he') || browserLang.startsWith('ar')) {
    currentLang = 'he';
}

document.documentElement.dir = (currentLang === 'he' || currentLang === 'ar') ? 'rtl' : 'ltr';
let userRole = localStorage.getItem('role') || null;
let authToken = localStorage.getItem('token') || null;
let clientId = localStorage.getItem('clientId') || null;
let currentTabId = null;
let currentWorkersData = [];
let editingWorkerId = null;

const ownerTabs = [
    { id: 'owner-clients', titleKey: 'tab_owner_clients', url: 'timetracker/owner/clients' },
    { id: 'owner-billing', titleKey: 'tab_owner_billing', url: 'timetracker/owner/billing' },
    { id: 'owner-invoices', titleKey: 'tab_owner_invoices', url: 'timetracker/owner/invoices' },
    { id: 'owner-pass', titleKey: 'tab_owner_pass', url: 'timetracker/owner/settings' }
];

const clientTabs = [
    { id: 'client-workers', titleKey: 'tab_client_workers', url: 'timetracker/client/workers' },
    { id: 'client-shifts', titleKey: 'tab_client_shifts', url: 'timetracker/client/shifts' }
];

function setLang(lang) {
    // Deprecated. Auto-detect is used now.
}

function formatHM(decimalHours) {
    if (!decimalHours || isNaN(decimalHours)) return '00:00';
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
    });
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
}

async function login() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: user, password: pass})
        });
        const r = await res.json();
        if (r.success) {
            authToken = r.token;
            userRole = r.role;
            if (r.clientId) clientId = r.clientId;
            localStorage.setItem('token', authToken);
            localStorage.setItem('role', userRole);
            if (clientId) localStorage.setItem('clientId', clientId);
            
            document.getElementById('login-pass').value = '';
            initApp();
        } else {
            errEl.textContent = r.error;
            errEl.classList.remove('hidden');
        }
    } catch(e) { errEl.textContent = 'Network error'; errEl.classList.remove('hidden'); }
}

function logout() {
    authToken = null; userRole = null; clientId = null;
    localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('clientId');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-screen').classList.add('flex');
}

function initApp() {
    if (!authToken) return;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('flex');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('flex');
    
    translatePage();
    renderTabs();
    const tabs = userRole === 'owner' ? ownerTabs : clientTabs;
    loadTab(tabs[0].id);
}

function renderTabs() {
    const tabs = userRole === 'owner' ? ownerTabs : clientTabs;
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    
    tabs.forEach(tab => {
        const isActive = tab.id === currentTabId;
        const tabEl = document.createElement('div');
        tabEl.className = `chrome-tab px-5 py-2 text-gray-700 flex items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${isActive ? 'active' : 'inactive'}`;
        tabEl.onclick = () => loadTab(tab.id);
        
        // Tab icon
        const icon = document.createElement('div');
        icon.className = "w-4 h-4 bg-blue-500 rounded-full mr-2 opacity-80 flex-shrink-0";
        if(userRole === 'owner') icon.classList.replace('bg-blue-500', 'bg-purple-500');
        
        const text = document.createElement('span');
        text.className = "truncate max-w-[120px]";
        text.textContent = i18n[currentLang][tab.titleKey];
        
        tabEl.appendChild(icon);
        tabEl.appendChild(text);
        container.appendChild(tabEl);
    });
}

function loadTab(tabId) {
    currentTabId = tabId;
    const tabs = userRole === 'owner' ? ownerTabs : clientTabs;
    const tabObj = tabs.find(t => t.id === tabId);
    if(tabObj) document.getElementById('url-bar').textContent = "https://" + tabObj.url;
    
    renderTabs();
    
    const content = document.getElementById('view-content');
    content.innerHTML = '<div class="text-center mt-10 text-gray-400">Loading...</div>';
    
    if (tabId === 'owner-clients') renderOwnerClients();
    else if (tabId === 'owner-billing') renderOwnerBilling();
    else if (tabId === 'owner-invoices') renderOwnerInvoices();
    else if (tabId === 'owner-pass') renderOwnerPassword();
    else if (tabId === 'client-workers') renderClientWorkers();
    else if (tabId === 'client-shifts') renderClientShifts();
}

async function renderOwnerClients() {
    const res = await fetch(`${API_URL}/admin/clients`, { headers: authHeaders() });
    const r = await res.json();
    if(!r.success) return logout();
    
    let html = `
    <h2 class="text-xl font-bold mb-4" data-i18n="tab_owner_clients"></h2>
    <div class="bg-white p-4 rounded shadow mb-6 border">
        <h3 class="font-bold mb-2" data-i18n="add_foreman"></h3>
        <div class="flex flex-wrap gap-2">
            <input id="new-f-name" class="border p-1 rounded" placeholder="${i18n[currentLang].foreman_name}">
            <input id="new-f-login" class="border p-1 rounded" placeholder="${i18n[currentLang].foreman_login}">
            <input id="new-f-pass" class="border p-1 rounded" placeholder="${i18n[currentLang].foreman_pass}">
            <button onclick="createForeman()" class="bg-blue-600 text-white px-3 py-1 rounded" data-i18n="save"></button>
        </div>
    </div>
    <table class="w-full text-left border-collapse bg-white shadow rounded">
        <thead><tr class="bg-gray-100 border-b">
            <th class="p-2" data-i18n="foreman_name"></th>
            <th class="p-2" data-i18n="foreman_login"></th>
            <th class="p-2" data-i18n="active"></th>
            <th class="p-2" data-i18n="action"></th>
        </tr></thead>
        <tbody>
    `;
    r.clients.forEach(c => {
        let currentTariffStr = c.tariffMode === 'per_hour' ? `${i18n[currentLang].per_hour} (${c.pricePerHour} ₪)` : `${i18n[currentLang].per_worker} (${c.pricePerUser} ₪)`;
        html += `<tr class="border-b hover:bg-gray-50">
            <td class="p-2">${c.name}</td>
            <td class="p-2">${c.username}</td>
            <td class="p-2">${c.isActive ? '✅' : '❌'}</td>
            <td class="p-2">
                <button onclick="toggleForeman('${c.id}')" class="text-blue-600 underline text-xs mr-2">${c.isActive ? i18n[currentLang].block_btn : i18n[currentLang].unblock_btn}</button>
                <button onclick="resetForemanPass('${c.id}')" class="text-orange-600 underline text-xs mr-2">${i18n[currentLang].reset_pass}</button>
                <button onclick="openTariffModal('${c.id}', '${c.tariffMode}', ${c.pricePerUser}, ${c.pricePerHour})" class="text-green-600 underline text-xs mr-2">${i18n[currentLang].tariff}</button>
                <button onclick="deleteForeman('${c.id}')" class="text-red-600 underline text-xs mr-2" data-i18n="delete"></button>
                <span class="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">${currentTariffStr}</span>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('view-content').innerHTML = html;
    translatePage();
}

async function createForeman() {
    const name = document.getElementById('new-f-name').value;
    const username = document.getElementById('new-f-login').value;
    const password = document.getElementById('new-f-pass').value;
    const res = await fetch(`${API_URL}/admin/clients`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({name, username, password})
    });
    const r = await res.json();
    if(r.success) loadTab('owner-clients'); else showToast(r.error, true);
}

async function toggleForeman(id) {
    const res = await fetch(`${API_URL}/admin/clients/${id}/toggle`, { method: 'POST', headers: authHeaders() });
    if((await res.json()).success) loadTab('owner-clients');
}

async function deleteForeman(id) {
    if (!confirm('Вы уверены, что хотите удалить этого прораба и все его данные (работники, счета, история)? Это действие нельзя отменить! / Are you sure?')) return;
    const res = await fetch(`${API_URL}/admin/clients/${id}`, { method: 'DELETE', headers: authHeaders() });
    if((await res.json()).success) loadTab('owner-clients'); else showToast('Ошибка удаления');
}

async function resetForemanPass(id) {
    const newPassword = prompt("Новый пароль:");
    if(!newPassword) return;
    const res = await fetch(`${API_URL}/admin/clients/${id}/reset`, { 
        method: 'POST', headers: authHeaders(), body: JSON.stringify({newPassword}) 
    });
    if((await res.json()).success) showToast("Пароль изменен!");
}

async function openTariffModal(id, mode, pUser, pHour) {
    const isPerHour = mode === 'per_hour';
    const currentPrice = isPerHour ? pHour : pUser;
    
    const { value: formValues } = await Swal.fire({
        title: 'Настройка тарифа',
        html: `
            <div class="flex flex-col gap-4 text-left">
                <label class="flex flex-col gap-1">
                    <span class="text-sm font-semibold">Тип тарифа:</span>
                    <select id="swal-mode" class="border p-2 rounded">
                        <option value="per_user" ${!isPerHour ? 'selected' : ''}>За работника</option>
                        <option value="per_hour" ${isPerHour ? 'selected' : ''}>За отработанный час</option>
                    </select>
                </label>
                <label class="flex flex-col gap-1">
                    <span class="text-sm font-semibold">Сумма (число):</span>
                    <input id="swal-price" type="number" step="0.01" class="border p-2 rounded" value="${currentPrice}">
                </label>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Сохранить',
        cancelButtonText: 'Отмена',
        preConfirm: () => {
            return {
                tariffMode: document.getElementById('swal-mode').value,
                price: document.getElementById('swal-price').value
            }
        }
    });

    if (formValues) {
        const res = await fetch(`${API_URL}/admin/clients/${id}/tariff`, { 
            method: 'POST', 
            headers: authHeaders(), 
            body: JSON.stringify(formValues) 
        });
        if((await res.json()).success) {
            Swal.fire({ icon: 'success', title: 'Успешно', timer: 1500, showConfirmButton: false });
            loadTab('owner-clients');
        } else {
            Swal.fire({ icon: 'error', title: 'Ошибка' });
        }
    }
}

async function renderOwnerBilling() {
    // Default dates (this month)
    const d = new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    
    let html = `
    <h2 class="text-xl font-bold mb-4" data-i18n="tab_owner_billing"></h2>
    <div class="bg-white p-4 rounded shadow mb-6 border flex gap-4 items-end">
        <div><label class="block text-xs text-gray-500" data-i18n="from"></label><input type="date" id="b-start" value="${firstDay}" class="border p-1 rounded"></div>
        <div><label class="block text-xs text-gray-500" data-i18n="to"></label><input type="date" id="b-end" value="${lastDay}" class="border p-1 rounded"></div>
        <button onclick="loadBilling()" class="bg-blue-600 text-white px-3 py-1 rounded" data-i18n="load"></button>
    </div>
    <div id="billing-results"></div>
    `;
    document.getElementById('view-content').innerHTML = html;
    translatePage();
    loadBilling();
}

async function loadBilling() {
    const start = document.getElementById('b-start').value;
    const end = document.getElementById('b-end').value;
    document.getElementById('billing-results').innerHTML = 'Loading...';
    
    const res = await fetch(`${API_URL}/admin/billing?startDate=${start}&endDate=${end}T23:59:59`, { headers: authHeaders() });
    const r = await res.json();
    if(!r.success) return showToast(r.error, true);
    
    let html = `<table class="w-full text-left border-collapse bg-white shadow rounded">
        <thead><tr class="bg-gray-100 border-b">
            <th class="p-2" data-i18n="foreman_name">Прораб</th>
            <th class="p-2" data-i18n="workers">Работники</th>
            <th class="p-2" data-i18n="hours">Часы</th>
            <th class="p-2 text-right">Тариф</th>
            <th class="p-2 text-right">К оплате</th>
            <th class="p-2 text-right">Счёт</th>
        </tr></thead><tbody>`;
    r.billingData.forEach(d => {
        let tariffLabel = d.tariffMode === 'per_hour' ? 'За час' : 'За работника';
        html += `<tr class="border-b hover:bg-gray-50">
            <td class="p-2 font-medium">${d.name}</td>
            <td class="p-2">${d.activeEmployees}</td>
            <td class="p-2">${formatHM(d.totalHours)}</td>
            <td class="p-2 text-right text-xs text-gray-500">${tariffLabel}</td>
            <td class="p-2 text-right font-bold text-red-600">${d.cost} ₪</td>
            <td class="p-2 text-right">
                <button onclick="createInvoice('${d.id}', '${start}', '${end}', ${d.cost})" class="bg-blue-600 text-white text-xs px-2 py-1 rounded">Выставить счёт</button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    const billingResultsEl = document.getElementById('billing-results');
    billingResultsEl.removeAttribute('data-i18n'); // CRITICAL FIX: prevent translatePage from overwriting innerHTML
    billingResultsEl.innerHTML = html;
    translatePage();
}

async function createInvoice(clientId, start, end, amount) {
    if (amount <= 0) return Swal.fire({ icon: 'warning', title: 'Сумма равна 0' });
    const res = await fetch(`${API_URL}/admin/invoices`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ clientId, startDate: start, endDate: end, amount })
    });
    const r = await res.json();
    if(r.success) {
        Swal.fire({ icon: 'success', title: 'Счёт выставлен!', timer: 1500, showConfirmButton: false });
    } else {
        Swal.fire({ icon: 'error', title: r.error });
    }
}

async function renderOwnerInvoices() {
    const res = await fetch(`${API_URL}/admin/invoices`, { headers: authHeaders() });
    const r = await res.json();
    if(!r.success) return showToast(r.error, true);

    let html = `
    <h2 class="text-xl font-bold mb-4" data-i18n="invoices_title">Выставленные счета (Invoices)</h2>
    <table class="w-full text-left border-collapse bg-white shadow rounded">
        <thead><tr class="bg-gray-100 border-b">
            <th class="p-2" data-i18n="foreman_name">Прораб</th>
            <th class="p-2" data-i18n="period">Период</th>
            <th class="p-2 text-right" data-i18n="amount">Сумма</th>
            <th class="p-2 text-center" data-i18n="status">Статус</th>
            <th class="p-2 text-center" data-i18n="action">Действие</th>
        </tr></thead><tbody>`;
    r.invoices.forEach(inv => {
        const start = new Date(inv.startDate).toLocaleDateString();
        const end = new Date(inv.endDate).toLocaleDateString();
        const isPaid = inv.status === 'paid';
        const statusHtml = isPaid ? `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" data-i18n="paid">ОПЛАЧЕН</span>` : `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" data-i18n="pending">ОЖИДАЕТ</span>`;
        
        html += `<tr class="border-b hover:bg-gray-50">
            <td class="p-2">${inv.client.name} (${inv.client.username})</td>
            <td class="p-2 text-xs">${start} - ${end}</td>
            <td class="p-2 text-right font-bold">${inv.amount.toFixed(2)} ₪</td>
            <td class="p-2 text-center">${statusHtml}</td>
            <td class="p-2 text-center">
                <button onclick="toggleInvoiceStatus(${inv.id})" class="text-blue-600 underline text-xs border border-blue-600 rounded px-2 py-1 hover:bg-blue-50 mb-1" data-i18n="action">Изменить статус</button>
                <button onclick="printInvoice(${inv.id}, '${inv.client.name}', '${start}', '${end}', ${inv.amount})" class="text-gray-600 underline text-xs border border-gray-600 rounded px-2 py-1 hover:bg-gray-50 mx-1" data-i18n="print">Печать</button>
                <button onclick="deleteInvoice(${inv.id})" class="text-red-600 underline text-xs border border-red-600 rounded px-2 py-1 hover:bg-red-50" data-i18n="delete">Удалить</button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    const viewContentEl = document.getElementById('view-content');
    viewContentEl.removeAttribute('data-i18n');
    viewContentEl.innerHTML = html;
    translatePage();
}

async function toggleInvoiceStatus(id) {
    const res = await fetch(`${API_URL}/admin/invoices/${id}/toggle`, { method: 'POST', headers: authHeaders() });
    if((await res.json()).success) renderOwnerInvoices();
}

async function deleteInvoice(id) {
    if (!confirm('Удалить этот счёт? / Delete this invoice?')) return;
    const res = await fetch(`${API_URL}/admin/invoices/${id}`, { method: 'DELETE', headers: authHeaders() });
    if((await res.json()).success) renderOwnerInvoices();
}

function printInvoice(id, clientName, start, end, amount) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`<html><head><title>Invoice #${id}</title>`);
    printWindow.document.write(`<style>body { font-family: sans-serif; padding: 40px; } .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; } .total { font-size: 24px; font-weight: bold; margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; }</style>`);
    printWindow.document.write('</head><body >');
    printWindow.document.write(`<div class="header"><h1>Invoice / חשבונית</h1></div>`);
    printWindow.document.write(`<p><strong>Invoice #:</strong> ${id}</p>`);
    printWindow.document.write(`<p><strong>Client:</strong> ${clientName}</p>`);
    printWindow.document.write(`<p><strong>Period:</strong> ${start} - ${end}</p>`);
    printWindow.document.write(`<div class="total">Total Amount: ${amount.toFixed(2)} ₪</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
}

function renderOwnerPassword() {
    let html = `
    <h2 class="text-xl font-bold mb-4" data-i18n="tab_owner_pass"></h2>
    <div class="bg-white p-6 rounded shadow border max-w-sm">
        <label class="block mb-2" data-i18n="old_pass"></label>
        <input type="password" id="owner-old-pass" class="w-full border p-2 rounded mb-4">
        <label class="block mb-2" data-i18n="new_pass"></label>
        <input type="password" id="owner-new-pass" class="w-full border p-2 rounded mb-4">
        <button onclick="changeOwnerPass()" class="bg-blue-600 text-white px-4 py-2 rounded w-full" data-i18n="save"></button>
    </div>
    `;
    document.getElementById('view-content').innerHTML = html;
    translatePage();
}

async function changeOwnerPass() {
    const oldPassword = document.getElementById('owner-old-pass').value;
    const newPassword = document.getElementById('owner-new-pass').value;
    if(!oldPassword || !newPassword) return showToast("Введите пароли");
    const res = await fetch(`${API_URL}/admin/password`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({oldPassword, newPassword})
    });
    const r = await res.json();
    if(r.success) { 
        showToast("Пароль успешно изменен!"); 
        document.getElementById('owner-old-pass').value=''; 
        document.getElementById('owner-new-pass').value=''; 
    } else {
        showToast(r.error, true);
    }
}

async function renderClientWorkers() {
    const res = await fetch(`${API_URL}/client/employees`, { headers: authHeaders() });
    const r = await res.json();
    currentWorkersData = r.employees;
    
    let html = `
    <div class="bg-white p-4 rounded shadow mb-6 border">
        <h3 class="font-bold mb-2" data-i18n="add_worker"></h3>
        <div class="flex flex-wrap gap-2 items-end">
            <div><label class="text-xs text-gray-500">ID (phone)</label><input id="w-id" class="border p-1 rounded w-24"></div>
            <div><label class="text-xs text-gray-500" data-i18n="worker_name"></label><input id="w-name" class="border p-1 rounded"></div>
            <div><label class="text-xs text-gray-500" data-i18n="lat"></label><input id="w-lat" class="border p-1 rounded w-24" onchange="fetchAddress()"></div>
            <div><label class="text-xs text-gray-500" data-i18n="lng"></label><input id="w-lng" class="border p-1 rounded w-24" onchange="fetchAddress()"></div>
            <button onclick="getMyLocation()" class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-300" data-i18n="get_my_loc"></button>
            <button onclick="fetchAddress()" class="bg-gray-200 text-xs px-2 py-1 rounded" data-i18n="geocode"></button>
            <div class="w-full"></div>
            <div><label class="text-xs text-gray-500" data-i18n="address"></label><input id="w-addr" class="border p-1 rounded w-64 bg-gray-50" readonly></div>
            <div><label class="text-xs text-gray-500" data-i18n="rad"></label><input id="w-rad" class="border p-1 rounded w-20" value="500"></div>
            <div class="flex items-center mb-1"><input type="checkbox" id="w-mob" class="mr-1"><label class="text-xs" data-i18n="mobile"></label></div>
            <button onclick="saveWorker()" id="btn-save-worker" class="bg-blue-600 text-white px-3 py-1 rounded" data-i18n="save"></button>
            <button onclick="cancelEditWorker()" id="btn-cancel-worker" class="hidden bg-gray-400 text-white px-3 py-1 rounded" data-i18n="cancel"></button>
        </div>
        <div class="w-full mt-3 pt-3 border-t border-gray-200">
            <span class="text-xs font-bold text-gray-600 mb-2 block" data-i18n="indiv_shifts"></span>
            <div class="flex space-x-4">
                <div>
                    <label class="text-xs text-gray-500 block" data-i18n="morning"></label>
                    <div class="flex space-x-1">
                        <input type="time" id="w-sh-m-s" class="border p-1 rounded w-20 text-center font-mono text-xs">
                        <input type="time" id="w-sh-m-e" class="border p-1 rounded w-20 text-center font-mono text-xs">
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-500 block" data-i18n="evening"></label>
                    <div class="flex space-x-1">
                        <input type="time" id="w-sh-e-s" class="border p-1 rounded w-20 text-center font-mono text-xs">
                        <input type="time" id="w-sh-e-e" class="border p-1 rounded w-20 text-center font-mono text-xs">
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-500 block" data-i18n="night"></label>
                    <div class="flex space-x-1">
                        <input type="time" id="w-sh-n-s" class="border p-1 rounded w-20 text-center font-mono text-xs">
                        <input type="time" id="w-sh-n-e" class="border p-1 rounded w-20 text-center font-mono text-xs">
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <h3 class="font-bold mb-2" data-i18n="tab_client_workers"></h3>
    <table class="w-full text-left border-collapse bg-white shadow rounded">
        <thead><tr class="bg-gray-100 border-b">
            <th class="p-2">ID</th>
            <th class="p-2" data-i18n="worker_name"></th>
            <th class="p-2">GPS</th>
            <th class="p-2" data-i18n="mobile"></th>
            <th class="p-2">Link</th>
            <th class="p-2" data-i18n="action"></th>
        </tr></thead><tbody id="workers-list">
    `;
    r.employees.forEach(e => {
        const link = `${window.location.origin}/app.html?cid=${localStorage.getItem('clientId')}&empId=${e.empId}`;
        const hasShifts = [e.shiftMorningStart, e.shiftEveningStart, e.shiftNightStart].some(Boolean);
        const shiftHtml = hasShifts ? `<div class="text-[10px] text-green-600 font-bold bg-green-50 rounded px-1 inline-block mt-1">Особые смены</div>` : '';
        html += `<tr class="border-b hover:bg-gray-50">
            <td class="p-2">${e.empId}</td>
            <td class="p-2 font-medium">${e.empName} ${shiftHtml}</td>
            <td class="p-2 text-xs text-gray-500">${e.address ? e.address : e.lat + ', ' + e.lng} <br><span class="text-[10px] text-gray-400">R: ${e.radius}m</span></td>
            <td class="p-2"><input type="checkbox" onchange="toggleMobile('${e.empId}', this.checked)" ${e.isMobile ? 'checked' : ''}></td>
            <td class="p-2">
                <button onclick="navigator.clipboard.writeText('${link}'); showToast('${i18n[currentLang].copied}')" class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mb-1">${i18n[currentLang].copy_link}</button>
                <button onclick="printWorkerQR('${e.empName}', '${link}')" class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border">${i18n[currentLang].qr_print}</button>
            </td>
            <td class="p-2">
                <button onclick="editWorker('${e.empId}')" class="text-blue-600 underline text-xs mr-2" data-i18n="edit"></button>
                <button onclick="deleteWorker('${e.empId}')" class="text-red-600 underline text-xs" data-i18n="delete"></button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('view-content').innerHTML = html;
    translatePage();
}

function printWorkerQR(name, link) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}`;
    const printWindow = window.open('', '', 'height=500,width=400');
    printWindow.document.write(`<html><head><title>QR Code - ${name}</title>`);
    printWindow.document.write(`<style>body { font-family: sans-serif; text-align: center; padding: 40px; } h2 { margin-bottom: 20px; } img { margin: 0 auto; border: 1px solid #ccc; padding: 10px; border-radius: 8px; } p { margin-top: 20px; font-size: 12px; color: #666; word-wrap: break-word; }</style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>${i18n[currentLang].worker || 'Worker'}: ${name}</h2>`);
    printWindow.document.write(`<img src="${qrUrl}" alt="QR Code" onload="setTimeout(() => window.print(), 500)" />`);
    printWindow.document.write(`<p>${i18n[currentLang].qr_scan_text || 'Scan this code with your phone camera to install the time tracking app.'}</p>`);
    printWindow.document.write(`<p style="font-size: 10px; opacity: 0.6;">${link}</p>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
}

function getMyLocation() {
    if (!navigator.geolocation) return showToast("Geolocation not supported");
    document.getElementById('w-lat').value = '...';
    document.getElementById('w-lng').value = '...';
    navigator.geolocation.getCurrentPosition((pos) => {
        document.getElementById('w-lat').value = pos.coords.latitude.toFixed(6);
        document.getElementById('w-lng').value = pos.coords.longitude.toFixed(6);
        fetchAddress();
    }, () => {
        showToast("Failed to get location.");
        document.getElementById('w-lat').value = '';
        document.getElementById('w-lng').value = '';
    }, { enableHighAccuracy: true });
}

async function fetchAddress() {
    const lat = document.getElementById('w-lat').value;
    const lng = document.getElementById('w-lng').value;
    if (!lat || !lng) return showToast("Введите широту и долготу");
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
            document.getElementById('w-addr').value = data.display_name;
        } else {
            document.getElementById('w-addr').value = "Адрес не найден";
        }
    } catch(e) {
        document.getElementById('w-addr').value = "Ошибка сети";
    }
}

async function saveWorker() {
    const empId = document.getElementById('w-id').value;
    const empName = document.getElementById('w-name').value;
    const lat = document.getElementById('w-lat').value;
    const lng = document.getElementById('w-lng').value;
    const radius = document.getElementById('w-rad').value;
    const isMobile = document.getElementById('w-mob').checked;
    const address = document.getElementById('w-addr').value;
    
    const smS = document.getElementById('w-sh-m-s').value;
    const smE = document.getElementById('w-sh-m-e').value;
    const seS = document.getElementById('w-sh-e-s').value;
    const seE = document.getElementById('w-sh-e-e').value;
    const snS = document.getElementById('w-sh-n-s').value;
    const snE = document.getElementById('w-sh-n-e').value;
    
    if(!empId || !empName) return showToast("ID and Name required");
    
    let url = `${API_URL}/client/employees`;
    let method = 'POST';
    if (editingWorkerId) {
        url = `${API_URL}/client/employees/${editingWorkerId}`;
        method = 'PUT';
    }
    
    const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({empId, empName, lat, lng, radius, isMobile, address, smS, smE, seS, seE, snS, snE})
    });
    const r = await res.json();
    if(r.success) {
        editingWorkerId = null;
        loadTab('client-workers');
    } else {
        showToast(r.error || "Error saving worker", true);
    }
}

function editWorker(empId) {
    const w = currentWorkersData.find(e => e.empId === empId);
    if(!w) return;
    editingWorkerId = empId;
    document.getElementById('w-id').value = w.empId;
    document.getElementById('w-id').disabled = true; // Can't change ID easily
    document.getElementById('w-name').value = w.empName;
    document.getElementById('w-lat').value = w.lat;
    document.getElementById('w-lng').value = w.lng;
    document.getElementById('w-rad').value = w.radius;
    document.getElementById('w-mob').checked = w.isMobile;
    document.getElementById('w-addr').value = w.address || "";
    
    document.getElementById('w-sh-m-s').value = w.shiftMorningStart || "";
    document.getElementById('w-sh-m-e').value = w.shiftMorningEnd || "";
    document.getElementById('w-sh-e-s').value = w.shiftEveningStart || "";
    document.getElementById('w-sh-e-e').value = w.shiftEveningEnd || "";
    document.getElementById('w-sh-n-s').value = w.shiftNightStart || "";
    document.getElementById('w-sh-n-e').value = w.shiftNightEnd || "";
    
    const btnSave = document.getElementById('btn-save-worker');
    btnSave.textContent = i18n[currentLang].save_changes || i18n[currentLang].save;
    document.getElementById('btn-cancel-worker').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEditWorker() {
    editingWorkerId = null;
    loadTab('client-workers');
}

async function deleteWorker(empId) {
    if(!confirm("Удалить?")) return;
    const res = await fetch(`${API_URL}/client/employees/${empId}`, { method: 'DELETE', headers: authHeaders() });
    if((await res.json()).success) renderClientWorkers();
}

async function toggleMobile(empId, isMobile) {
    await fetch(`${API_URL}/client/employees/${empId}/mobile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ isMobile })
    });
}

async function renderClientShifts() {
    const res = await fetch(`${API_URL}/client/settings`, { headers: authHeaders() });
    const r = await res.json();
    const s = r.settings;
    
    // Fetch employees for the dropdown
    const wRes = await fetch(`${API_URL}/client/employees`, { headers: authHeaders() });
    const wData = await wRes.json();
    let empOptions = `<option value="all" data-i18n="all_workers">Все работники</option>`;
    if (wData.success && wData.employees) {
        wData.employees.forEach(emp => {
            empOptions += `<option value="${emp.id}">${emp.empName} (ID: ${emp.empId})</option>`;
        });
    }

    let html = `
    <h2 class="text-xl font-bold mb-4" data-i18n="tab_client_shifts"></h2>
    <div class="bg-white p-6 rounded shadow border max-w-lg mb-6">
        <h3 class="font-bold mb-4" data-i18n="global_shifts"></h3>
        
        <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
                <label class="block text-xs font-bold text-gray-600 mb-1" data-i18n="morning"></label>
                <input type="time" id="sh-m-s" value="${s.shiftMorningStart}" class="border p-1 rounded w-full mb-1 text-center font-mono text-sm">
                <input type="time" id="sh-m-e" value="${s.shiftMorningEnd}" class="border p-1 rounded w-full text-center font-mono text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-600 mb-1" data-i18n="evening"></label>
                <input type="time" id="sh-e-s" value="${s.shiftEveningStart}" class="border p-1 rounded w-full mb-1 text-center font-mono text-sm">
                <input type="time" id="sh-e-e" value="${s.shiftEveningEnd}" class="border p-1 rounded w-full text-center font-mono text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-600 mb-1" data-i18n="night"></label>
                <input type="time" id="sh-n-s" value="${s.shiftNightStart}" class="border p-1 rounded w-full mb-1 text-center font-mono text-sm">
                <input type="time" id="sh-n-e" value="${s.shiftNightEnd}" class="border p-1 rounded w-full text-center font-mono text-sm">
            </div>
        </div>
        <button onclick="saveClientSettings()" class="bg-blue-600 text-white px-4 py-2 rounded" data-i18n="save"></button>
    </div>

    <h3 class="font-bold mb-4" data-i18n="matrix_title"></h3>
    <div class="bg-white p-4 rounded shadow border mb-6 overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm min-w-[800px]" id="schedule-matrix">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="p-2 w-48" data-i18n="worker_name">Разотник</th>
                    <th class="p-2" data-i18n="d_sun"></th><th class="p-2" data-i18n="d_mon"></th><th class="p-2" data-i18n="d_tue"></th>
                    <th class="p-2" data-i18n="d_wed"></th><th class="p-2" data-i18n="d_thu"></th><th class="p-2" data-i18n="d_fri"></th><th class="p-2" data-i18n="d_sat"></th>
                </tr>
            </thead>
            <tbody id="matrix-body">
                <tr><td colspan="8" class="text-center p-4" data-i18n="loading"></td></tr>
            </tbody>
        </table>
    </div>
    
    <h3 class="font-bold mb-4" data-i18n="hours_worked"></h3>
    <div class="bg-white p-4 rounded shadow border">
        <!-- Billing/Hours view for Foreman -->
        <div class="flex flex-wrap gap-4 items-end mb-4">
            <div><label class="block text-xs text-gray-500" data-i18n="worker_name"></label>
                 <select id="c-emp" class="border p-1 rounded min-w-[150px]">
                    ${empOptions}
                 </select>
            </div>
            <div><label class="block text-xs text-gray-500" data-i18n="from"></label><input type="date" id="c-start" class="border p-1 rounded"></div>
            <div><label class="block text-xs text-gray-500" data-i18n="to"></label><input type="date" id="c-end" class="border p-1 rounded"></div>
            <button onclick="loadClientHours()" class="bg-blue-600 text-white px-3 py-1 rounded" data-i18n="load"></button>
            <button onclick="clearClientHours()" class="bg-gray-400 text-white px-3 py-1 rounded" data-i18n="clear_btn">Очистить</button>
        </div>
        <div id="client-hours-results" data-i18n="choose_period"></div>
    </div>
    `;
    document.getElementById('view-content').innerHTML = html;
    
    const d = new Date();
    document.getElementById('c-start').value = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('c-end').value = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    
    translatePage();
    loadMatrix();
}

async function loadMatrix() {
    // Load workers
    const wRes = await fetch(`${API_URL}/client/employees`, { headers: authHeaders() });
    const wData = await wRes.json();
    
    // Load schedules
    const sRes = await fetch(`${API_URL}/client/schedule`, { headers: authHeaders() });
    const sData = await sRes.json();
    
    const tbody = document.getElementById('matrix-body');
    tbody.innerHTML = '';
    
    if(!wData.employees || wData.employees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center p-4" data-i18n="no_workers"></td></tr>`;
        translatePage();
        return;
    }

    wData.employees.forEach(w => {
        let tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `<td class="p-2 font-medium truncate">${w.empName}</td>`;
        
        for(let day = 0; day < 7; day++) {
            let shift = 'none';
            // Find existing schedule
            const existing = sData.schedules.find(s => s.geofenceId === w.id && s.dayOfWeek === day);
            if (existing) shift = existing.shiftType;
            
            const isM = shift.includes('morning');
            const isE = shift.includes('evening');
            const isN = shift.includes('night');

            tr.innerHTML += `
            <td class="p-1 border-r last:border-r-0 align-top">
                <div class="flex flex-col gap-1 text-xs px-1">
                    <label class="flex items-center gap-1 cursor-pointer w-max">
                        <input type="checkbox" onchange="updateScheduleMulti(${w.id}, ${day})" id="chk_${w.id}_${day}_m" ${isM?'checked':''}>
                        <span data-i18n="morning"></span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer w-max">
                        <input type="checkbox" onchange="updateScheduleMulti(${w.id}, ${day})" id="chk_${w.id}_${day}_e" ${isE?'checked':''}>
                        <span data-i18n="evening"></span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer w-max">
                        <input type="checkbox" onchange="updateScheduleMulti(${w.id}, ${day})" id="chk_${w.id}_${day}_n" ${isN?'checked':''}>
                        <span data-i18n="night"></span>
                    </label>
                </div>
            </td>`;
        }
        tbody.appendChild(tr);
    });
    translatePage();
}

async function updateScheduleMulti(geofenceId, dayOfWeek) {
    const m = document.getElementById(`chk_${geofenceId}_${dayOfWeek}_m`).checked;
    const e = document.getElementById(`chk_${geofenceId}_${dayOfWeek}_e`).checked;
    const n = document.getElementById(`chk_${geofenceId}_${dayOfWeek}_n`).checked;
    
    let shifts = [];
    if(m) shifts.push('morning');
    if(e) shifts.push('evening');
    if(n) shifts.push('night');
    
    const shiftType = shifts.length > 0 ? shifts.join(',') : 'none';
    
    await fetch(`${API_URL}/client/schedule`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ geofenceId, dayOfWeek, shiftType })
    });
}

async function saveClientSettings() {
    const payload = {
        shiftMorningStart: document.getElementById('sh-m-s').value,
        shiftMorningEnd: document.getElementById('sh-m-e').value,
        shiftEveningStart: document.getElementById('sh-e-s').value,
        shiftEveningEnd: document.getElementById('sh-e-e').value,
        shiftNightStart: document.getElementById('sh-n-s').value,
        shiftNightEnd: document.getElementById('sh-n-e').value,
    };
    const res = await fetch(`${API_URL}/client/settings`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
    });
    if((await res.json()).success) showToast("Сохранено!");
}

let lastReportData = [];

async function loadClientHours() {
    try {
        const startEl = document.getElementById('c-start');
        const endEl = document.getElementById('c-end');
        if (!startEl || !endEl) return showToast('Ошибка UI: поля дат не найдены!');
        
        const start = startEl.value;
        const end = endEl.value;
        const resultsEl = document.getElementById('client-hours-results');
        
        if (!resultsEl) return showToast('Ошибка UI: блок результатов не найден!');
        
        resultsEl.innerHTML = '<div class="text-blue-500 p-4 font-bold animate-pulse">Загрузка данных с сервера... Пожалуйста, подождите.</div>';
        
        const res = await fetch(`${API_URL}/client/hours?startDate=${start}&endDate=${end}T23:59:59`, { headers: authHeaders() });
        
        if (!res.ok) {
            resultsEl.innerHTML = `<div class="text-red-500 p-4">Ошибка сети: ${res.status}</div>`;
            return showToast(`Ошибка сети: ${res.status}`);
        }
        
        const r = await res.json();
        
        if (!r.success) {
            resultsEl.innerHTML = `<div class="text-red-500 p-4 font-bold">Ошибка сервера: ${r.error}</div>`;
            return showToast(`Ошибка сервера: ${r.error}`);
        }
        
        const empFilter = document.getElementById('c-emp') ? document.getElementById('c-emp').value : 'all';
        let filteredReport = r.report || [];
        if (empFilter !== 'all') {
            filteredReport = filteredReport.filter(d => d.empId === empFilter);
        }

        lastReportData = filteredReport; // save for export
        
        let totalSumDec = 0;
        if (filteredReport.length > 0) {
            totalSumDec = filteredReport.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0);
        }
        
        let html = `
            <div class="flex justify-between items-center mb-4">
                <div class="text-xl font-bold text-gray-800">
                    <span data-i18n="total_sum_hours">Всего часов за период:</span> 
                    <span class="text-blue-600 bg-blue-100 px-3 py-1 rounded">${formatHM(totalSumDec)}</span>
                </div>
                <button onclick="exportClientHoursCSV()" class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 shadow font-bold" data-i18n="download_report">Скачать Отчёт (Excel)</button>
            </div>
            <div id="export-container" class="space-y-8">`;
            
        if (filteredReport.length === 0) {
            html += `<div class="p-4 text-center text-gray-500 bg-white shadow rounded">Нет данных за выбранный период</div></div>`;
        } else {
            // Group by employee
            const empGroups = {};
            filteredReport.forEach(d => {
                if (!empGroups[d.empId]) empGroups[d.empId] = { name: d.name, isDeleted: d.isDeleted, rows: [], total: 0 };
                empGroups[d.empId].rows.push(d);
                empGroups[d.empId].total += parseFloat(d.totalHours || 0);
            });

            for (const empId in empGroups) {
                const grp = empGroups[empId];
                const displayName = grp.isDeleted ? i18n[currentLang]['deleted_worker'] : (grp.name || '-');
                html += `
                <div class="bg-white shadow rounded border overflow-hidden">
                    <div class="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
                        <h4 class="font-bold text-blue-800 text-lg">${displayName} <span class="text-sm font-normal text-gray-500">(ID: ${empId})</span></h4>
                        <div class="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded border border-blue-200">Σ: ${formatHM(grp.total)}</div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm employee-table-export">
                        <thead><tr class="bg-gray-100 border-b">
                            <th class="p-2 w-32" data-i18n="date">Дата</th>
                            <th class="p-2" data-i18n="shift_times">Вход/Выход</th>
                            <th class="p-2" data-i18n="hours">Всего Часов</th>
                            <th class="p-2 text-indigo-600" data-i18n="night_hours">Ночные</th>
                            <th class="p-2 text-purple-600" data-i18n="saturday_hours">Суббота</th>
                            <th class="p-2 text-red-600" data-i18n="overtime_hours">Сверхурочные</th>
                        </tr></thead><tbody>`;
                
                grp.rows.forEach(d => {
                    html += `<tr class="border-b hover:bg-gray-50">
                        <td class="p-2 text-gray-500">${d.date || '-'}</td>
                        <td class="p-2 text-gray-600 font-mono text-xs">${d.times || '-'}</td>
                        <td class="p-2 font-bold text-blue-600">${formatHM(parseFloat(d.totalHours || 0))}</td>
                        <td class="p-2 text-indigo-600">${formatHM(parseFloat(d.nightHours || 0))}</td>
                        <td class="p-2 text-purple-600">${formatHM(parseFloat(d.saturdayHours || 0))}</td>
                        <td class="p-2 font-bold text-red-600">${formatHM(parseFloat(d.overtimeHours || 0))}</td>
                    </tr>`;
                });
                
                html += `</tbody></table></div></div>`;
            }
            html += `</div>`; // end export-container
        }

        resultsEl.removeAttribute('data-i18n');
        resultsEl.innerHTML = html;
        translatePage();
    } catch(e) {
        document.getElementById('client-hours-results').innerHTML = `<div class="text-red-500 p-4">Критическая ошибка: ${e.message}</div>`;
        showToast(`Критическая ошибка: ${e.message}`);
    }
}

function clearClientHours() {
    document.getElementById('c-start').value = '';
    document.getElementById('c-end').value = '';
    lastReportData = null;
    const resultsEl = document.getElementById('client-hours-results');
    resultsEl.removeAttribute('data-i18n');
    resultsEl.innerHTML = '<div class="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg" data-i18n="choose_period"></div>';
    translatePage();
}

function exportClientHoursCSV() {
    try {
        if(!lastReportData || lastReportData.length === 0) return showToast('Нет данных для выгрузки. Сначала загрузите таблицу.');
        
        // Use a bulletproof Excel HTML string to completely bypass all comma/semicolon/locale issues
        const tableHtml = document.getElementById('export-container').outerHTML;
        const excelHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8" />
                <!--[if gte mso 9]>
                <xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                <x:Name>Отчёт</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
                <![endif]-->
                <style>
                    body { font-family: sans-serif; }
                    table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
                    th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
                    th { background-color: #f3f4f6; }
                    h4 { margin: 10px 0 5px 0; font-size: 14pt; }
                </style>
            </head>
            <body dir="${document.documentElement.dir}">
                ${tableHtml}
            </body>
            </html>
        `;
        
        const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `report_daily_${new Date().toISOString().split('T')[0]}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch(e) {
        showToast(`Ошибка при выгрузке отчёта: ${e.message}`);
    }
}


// Auto-init
translatePage();
if(authToken) initApp();
