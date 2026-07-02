const fs = require('fs');

let code = fs.readFileSync('public/admin.js', 'utf8');

const startStr = "<!-- Chart and Top Workers -->";
const endStr = "} catch (e) {";
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `<!-- Charts and Top Workers -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <!-- Chart 1: Распределение (Пончик) -->
        <div class="bg-white p-6 rounded shadow border flex flex-col items-center">
            <h3 class="font-bold mb-4 text-gray-800 text-sm w-full">Типы часов (30 дн.)</h3>
            <div class="relative w-full h-48 flex justify-center">
                <canvas id="doughnutChart"></canvas>
            </div>
        </div>

        <!-- Chart 2: Динамика 7 дней -->
        <div class="bg-white p-6 rounded shadow border">
            <h3 class="font-bold mb-4 text-gray-800 text-sm">Активность (последние 7 дней)</h3>
            <div class="relative w-full h-48">
                <canvas id="barChart"></canvas>
            </div>
        </div>
        
        <!-- Top Workers -->
        <div class="bg-white p-6 rounded shadow border">
            <h3 class="font-bold mb-4 text-gray-800 text-sm border-b pb-2">Топ-5 сотрудников</h3>
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
        
        // ------------------
        // Render Doughnut Chart
        // ------------------
        const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
        const regularTotal = Math.max(0, sumTotal - sumOvertime - sumNight);
        new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Обычные', 'Сверхурочные', 'Ночные'],
                datasets: [{
                    data: [regularTotal.toFixed(1), sumOvertime.toFixed(1), sumNight.toFixed(1)],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, font: { size: 10 } }
                    }
                },
                cutout: '70%'
            }
        });

        // ------------------
        // Render Bar Chart (Last 7 Days)
        // ------------------
        const ctxBar = document.getElementById('barChart').getContext('2d');
        const allDates = Object.keys(dailyTotals);
        const last7Dates = allDates.slice(-7);
        
        const labels7 = last7Dates.map(d => {
            const parts = d.split('-');
            return parts[1] + '.' + parts[2];
        });
        const dataReg7 = last7Dates.map(d => dailyTotals[d]);
        const dataOvt7 = last7Dates.map(d => dailyOvertime[d]);
        const dataNig7 = last7Dates.map(d => dailyNight[d]);

        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels7,
                datasets: [
                    { label: 'Обыч.', data: dataReg7, backgroundColor: '#10b981' },
                    { label: 'Сверх.', data: dataOvt7, backgroundColor: '#f59e0b' },
                    { label: 'Ночн.', data: dataNig7, backgroundColor: '#3b82f6' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: { stacked: true, beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
        });

    `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Patched analytics charts successfully');
