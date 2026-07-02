const fs = require('fs');
let app = fs.readFileSync('public/app.html', 'utf8');

// 1. Auto-pause logic
const oldGpsLogic = `if (dist <= gfData.radius) {
                            statusEl.innerHTML = "IN ZONE";
                            statusEl.className = "mt-2 font-bold text-green-600";
                        } else {
                            statusEl.innerHTML = "OUT OF ZONE";
                            statusEl.className = "mt-2 font-bold text-red-600";
                        }`;

const newGpsLogic = `if (dist <= gfData.radius) {
                            statusEl.innerHTML = "IN ZONE";
                            statusEl.className = "mt-2 font-bold text-green-600";
                            if (!isClockedIn && window.autoPaused) {
                                window.autoPaused = false;
                                await logTime('Вход', true);
                            }
                        } else {
                            statusEl.innerHTML = "OUT OF ZONE";
                            statusEl.className = "mt-2 font-bold text-red-600";
                            if (isClockedIn && gfData.strictGps) {
                                window.autoPaused = true;
                                await logTime('Выход', true);
                            }
                        }`;

app = app.replace(oldGpsLogic, newGpsLogic);

const oldLogTimeDef = `async function logTime(action) {`;
const newLogTimeDef = `async function logTime(action, isAuto = false) {`;
app = app.replace(oldLogTimeDef, newLogTimeDef);

const oldLogSuccess = `isClockedIn = (action === 'Вход');
                    if (isClockedIn) startTimer(); else stopTimer();
                    setBtnState(isClockedIn);
                    Swal.fire({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 2000,
                        icon: 'success',
                        title: 'Успешно / Success'
                    });`;

const newLogSuccess = `isClockedIn = (action === 'Вход');
                    if (isClockedIn) startTimer(); else stopTimer();
                    setBtnState(isClockedIn);
                    if (!isAuto) {
                        Swal.fire({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 2000,
                            icon: 'success',
                            title: 'Успешно / Success'
                        });
                    } else {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            icon: 'info',
                            title: action === 'Вход' ? 'Смена возобновлена (В зоне)' : 'Смена приостановлена (Вне зоны)'
                        });
                    }`;

app = app.replace(oldLogSuccess, newLogSuccess);

// 2. Add Expenses button to UI
const oldButtonHtml = `<button id="btn-out" onclick="logTime('Выход')" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded text-xl shadow-lg transition opacity-50 cursor-not-allowed" disabled>
                Окончить Смену / Out
            </button>`;

const newButtonHtml = `<button id="btn-out" onclick="logTime('Выход')" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded text-xl shadow-lg transition opacity-50 cursor-not-allowed" disabled>
                Окончить Смену / Out
            </button>
            <div class="mt-8">
                <button onclick="addDailyNote()" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold p-3 rounded shadow transition">
                    + Добавить расход / Expense
                </button>
            </div>`;

app = app.replace(oldButtonHtml, newButtonHtml);

// Add addDailyNote function
const noteFunc = `
        async function addDailyNote() {
            const { value: noteText } = await Swal.fire({
                title: 'Заметки / Расходы',
                text: 'Укажите расходы за сегодня (например: Проезд 50)',
                input: 'textarea',
                inputPlaceholder: 'Введите текст...',
                showCancelButton: true,
                confirmButtonText: 'Сохранить',
                cancelButtonText: 'Отмена'
            });
            
            if (noteText) {
                try {
                    const res = await fetch('/api/worker/notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ empId, noteText })
                    });
                    if (res.ok) {
                        Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2000, icon: 'success', title: 'Сохранено!' });
                    }
                } catch(e) {}
            }
        }
`;

if (!app.includes('function addDailyNote')) {
    app = app.replace('</script>', noteFunc + '\n    </script>');
}

fs.writeFileSync('public/app.html', app, 'utf8');
console.log('patched app.html');
