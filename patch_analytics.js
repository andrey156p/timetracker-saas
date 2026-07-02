const fs = require('fs');

let code = fs.readFileSync('public/admin.js', 'utf8');

const startStr = "async function renderClientAnalytics() {";
const endStr = "const hebrewToLatin = {";
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `async function renderClientAnalytics() {
    document.getElementById('view-content').innerHTML = \`
    <h2 class="text-xl font-bold mb-4" data-i18n="tab_client_analytics">Аналитика</h2>
    
    <!-- Top 4 Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded shadow border border-l-4 border-l-blue-500">
            <div class="text-xs text-gray-500 font-bold uppercase mb-1">Всего часов (30 дн.)</div>
            <div id="stat-total" class="text-2xl font-black text-gray-800">...</div>
            <div id="stat-total-sub" class="text-xs text-gray-500 mt-1">...</div>
        </div>
        <div class="bg-white p-4 rounded shadow border border-l-4 border-l-indigo-500">
            <div class="text-xs text-gray-500 font-bold uppercase mb-1">Онлайн сейчас</div>
            <div id="stat-online" class="text-2xl font-black text-gray-800">...</div>
            <div id="stat-online-sub" class="text-xs text-indigo-500 mt-1 h-4 overflow-hidden text-ellipsis whitespace-nowrap"></div>
        </div>
        <div class="bg-white p-4 rounded shadow border border-l-4 border-l-green-500">
            <div class="text-xs text-gray-500 font-bold uppercase mb-1">Уникальных смен (сегодня)</div>
            <div id="stat-shifts" class="text-2xl font-black text-gray-800">...</div>
        </div>
        <div class="bg-white p-4 rounded shadow border border-l-4 border-l-red-500">
            <div class="text-xs text-gray-500 font-bold uppercase mb-1">Вычет за перерывы (30 дн.)</div>
            <div id="stat-lunch" class="text-2xl font-black text-gray-800">...</div>
        </div>
    </div>
    
    <!-- Chart and Top Workers -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-6 rounded shadow border lg:col-span-2">
            <h3 class="font-bold mb-4">График отработанных часов (последние 30 дней)</h3>
            <canvas id="analyticsChart" height="150"></canvas>
        </div>
        
        <div class="bg-white p-6 rounded shadow border">
            <h3 class="font-bold mb-4 text-gray-800 border-b pb-2">Топ-5 сотрудников</h3>
            <div id="top-workers-list" class="flex flex-col gap-3">
                <div class="text-sm text-gray-500 italic">Загрузка...</div>
            </div>
        </div>
    </div>
    \`;
    translatePage();
    
    // Fetch last 30 days data
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    try {
        const [hRes, eRes] = await Promise.all([
            fetch(\`\${API_URL}/client/hours?startDate=\${startStr}&endDate=\${endStr}\`, { headers: authHeaders() }),
            fetch(\`\${API_URL}/client/employees\`, { headers: authHeaders() })
        ]);
        
        const hData = await hRes.json();
        const eData = await eRes.json();
        
        if(!hData.success || !eData.success) return;
        
        // 1. Online Employees
        const onlineEmps = eData.employees.filter(e => e.isOnline);
        document.getElementById('stat-online').textContent = onlineEmps.length;
        if(onlineEmps.length > 0) {
            document.getElementById('stat-online-sub').textContent = onlineEmps.map(e => e.empName).join(', ');
            document.getElementById('stat-online-sub').title = onlineEmps.map(e => e.empName).join(', ');
        } else {
            document.getElementById('stat-online-sub').textContent = 'Нет активных смен';
        }
        
        // 2. Process hours
        const dailyTotals = {};
        const dailyOvertime = {};
        const dailyNight = {};
        let sumTotal = 0, sumOvertime = 0, sumNight = 0, sumSat = 0, sumLunch = 0;
        let todayShifts = new Set();
        const todayStr = endStr;
        
        const workerTotals = {};

        // Initialize 30 days
        for(let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
            const dStr = d.toISOString().split('T')[0];
            dailyTotals[dStr] = 0;
            dailyOvertime[dStr] = 0;
            dailyNight[dStr] = 0;
        }
        
        // Iterate over hData.report which is an array of daily summaries per worker
        if (hData.report && Array.isArray(hData.report)) {
            hData.report.forEach(row => {
                const date = row.date;
                const totalH = parseFloat(row.totalHours) || 0;
                const overtimeH = parseFloat(row.overtimeHours) || 0;
                const nightH = parseFloat(row.nightHours) || 0;
                const satH = parseFloat(row.saturdayHours) || 0;
                const lunchD = parseFloat(row.lunchDeduction) || 0;
                
                // Aggregates
                sumTotal += totalH;
                sumOvertime += overtimeH;
                sumNight += nightH;
                sumSat += satH;
                sumLunch += lunchD;
                
                // Worker Totals for Leaderboard
                if (!workerTotals[row.empId]) {
                    workerTotals[row.empId] = { name: row.name, hours: 0 };
                }
                workerTotals[row.empId].hours += totalH;
                
                // Daily Chart Data
                if (dailyTotals[date] !== undefined) {
                    dailyTotals[date] += (totalH - overtimeH - nightH); // Regular hours
                    dailyOvertime[date] += overtimeH;
                    dailyNight[date] += nightH;
                }
                
                // Today shifts
                if (date === todayStr && row.times) {
                    todayShifts.add(row.empId);
                }
            });
        }
        
        document.getElementById('stat-total').textContent = sumTotal.toFixed(1);
        document.getElementById('stat-total-sub').innerHTML = \`<span class="text-orange-500">Сверхурочные: \${sumOvertime.toFixed(1)}ч</span> | <span class="text-blue-500">Ночные: \${sumNight.toFixed(1)}ч</span> | <span class="text-purple-500">Шабат: \${sumSat.toFixed(1)}ч</span>\`;
        
        document.getElementById('stat-shifts').textContent = todayShifts.size;
        document.getElementById('stat-lunch').textContent = sumLunch.toFixed(1) + ' ч';
        
        // Render Top Workers
        const sortedWorkers = Object.values(workerTotals).sort((a, b) => b.hours - a.hours).slice(0, 5);
        let topWorkersHtml = '';
        if (sortedWorkers.length === 0) {
            topWorkersHtml = '<div class="text-sm text-gray-500">Нет данных</div>';
        } else {
            const maxHours = sortedWorkers[0].hours;
            sortedWorkers.forEach((w, idx) => {
                const pct = maxHours > 0 ? (w.hours / maxHours) * 100 : 0;
                topWorkersHtml += \`
                    <div class="flex flex-col">
                        <div class="flex justify-between text-sm font-medium mb-1">
                            <span class="truncate pr-2">\${idx+1}. \${w.name}</span>
                            <span class="text-blue-600">\${w.hours.toFixed(1)}ч</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="bg-blue-500 h-1.5 rounded-full" style="width: \${pct}%"></div>
                        </div>
                    </div>
                \`;
            });
        }
        document.getElementById('top-workers-list').innerHTML = topWorkersHtml;
        
        // Render Chart
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        const labels = Object.keys(dailyTotals).map(d => {
            const parts = d.split('-');
            return parts[1] + '.' + parts[2];
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Обычные часы',
                        data: Object.values(dailyTotals),
                        backgroundColor: '#10b981', // green-500
                    },
                    {
                        label: 'Сверхурочные',
                        data: Object.values(dailyOvertime),
                        backgroundColor: '#f59e0b', // amber-500
                    },
                    {
                        label: 'Ночные',
                        data: Object.values(dailyNight),
                        backgroundColor: '#3b82f6', // blue-500
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, grid: { color: '#f3f4f6' } }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });

    } catch (e) {
        console.error("Analytics Error", e);
    }
}

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Patched renderClientAnalytics successfully');
