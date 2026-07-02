
        const translations = {
            "en": {
                nav_login: "Login",
                nav_register: "Try 14 Days Free",
                hero_title: "Stop Overpaying Your Workforce",
                hero_subtitle: "The smartest GPS time tracking SaaS for construction, field workers, and mobile teams.",
                hero_btn: "Start Free Trial",
                pod_title: "Listen to our System Overview ",
                feat1_t: "Strict GPS Geofencing",
                feat1_d: "Workers can only clock in within the assigned radius. If they leave, the shift automatically pauses.",
                feat2_t: "Offline Mode (PWA)",
                feat2_d: "No internet? No problem. The app logs timestamps and GPS via satellite, then syncs automatically.",
                feat3_t: "Auto-Timesheets",
                feat3_d: "Generate PDF or CSV reports in 1 click. Overtime, night hours, and lunch deductions are calculated automatically."
            },
            "ru": {
                nav_login: "Войти",
                nav_register: "Попробовать 14 дней",
                hero_title: "Хватит переплачивать за неотработанные часы",
                hero_subtitle: "Умный GPS-трекер рабочего времени для строителей, бригад и выездного персонала.",
                hero_btn: "Начать бесплатный триал",
                pod_title: "Послушайте обзор системы ",
                feat1_t: "Строгий GPS-контроль",
                feat1_d: "Вход только в радиусе объекта. Если работник уходит по делам, смена автоматически ставится на паузу.",
                feat2_t: "Оффлайн режим",
                feat2_d: "Нет интернета в подвале? Приложение сохраняет GPS локально и отправляет данные при появлении сети.",
                feat3_t: "Авто-отчеты PDF / CSV",
                feat3_d: "Генерация табелей в 1 клик. Переработки, ночные смены и авто-вычет обедов считаются сами."
            },
            "he": {
                nav_login: "התחברות",
                nav_register: "נסה 14 ימים בחינם",
                hero_title: "תפסיק לשלם על שעות שלא עבדו",
                hero_subtitle: "מערכת דיווחי הנוכחות החכמה ביותר עם GPS לבנאים, צוותי שטח ועובדים ניידים.",
                hero_btn: "התחל ניסיון בחינם",
                pod_title: "האזן לסקירת המערכת שלנו ",
                feat1_t: "בקרת GPS קפדנית",
                feat1_d: "עובדים יכולים לדווח רק ברדיוס האתר. אם הם עוזבים, המשמרת מושהית אוטומטית.",
                feat2_t: "מצב לא מקוון (PWA)",
                feat2_d: "אין אינטרנט? אין בעיה. האפליקציה שומרת נתונים ו-GPS באמצעות לוויין, ומסתנכרנת כשחוזר האינטרנט.",
                feat3_t: "דוחות נוכחות אוטומטיים",
                feat3_d: "הפקת דוחות PDF או CSV בלחיצה. שעות נוספות, שעות לילה וניכוי הפסקות מחושבים אוטומטית."
            }
        };

        function applyTranslations() {
            let lang = navigator.language.slice(0, 2);
            if (!translations[lang]) lang = "en";
            
            if (lang === "he") {
                document.getElementById('html-root').classList.add('rtl');
                document.getElementById('html-root').setAttribute('dir', 'rtl');
            }

            const t = translations[lang];
            document.getElementById('nav-login').innerText = t.nav_login;
            document.getElementById('nav-register').innerText = t.nav_register;
            document.getElementById('hero-title').innerText = t.hero_title;
            document.getElementById('hero-subtitle').innerText = t.hero_subtitle;
            document.getElementById('hero-btn').innerText = t.hero_btn;
            document.getElementById('podcast-title').innerText = t.pod_title;
            
            document.getElementById('feat1-title').innerText = t.feat1_t;
            document.getElementById('feat1-desc').innerText = t.feat1_d;
            document.getElementById('feat2-title').innerText = t.feat2_t;
            document.getElementById('feat2-desc').innerText = t.feat2_d;
            document.getElementById('feat3-title').innerText = t.feat3_t;
            document.getElementById('feat3-desc').innerText = t.feat3_d;
        }

        applyTranslations();

        async function openRegister() {
            let lang = navigator.language.slice(0, 2);
            const isHe = lang === 'he';
            
            const { value: formValues } = await Swal.fire({
                title: isHe ? 'התחל 14 ימי ניסיון' : (lang==='ru' ? 'Старт 14-дневного Триала' : 'Start 14-Day Trial'),
                html: `
                    <input id="swal-company" class="swal2-input" placeholder="${isHe?'שם החברה':'Название Компании / Company Name'}">
                    <input id="swal-user" class="swal2-input" placeholder="${isHe?'שם משתמש':'Логин / Username'}">
                    <input id="swal-pass" type="password" class="swal2-input" placeholder="${isHe?'סיסמה':'Пароль / Password'}">
                `,
                focusConfirm: false,
                confirmButtonText: isHe ? 'הרשמה' : (lang==='ru' ? 'Регистрация' : 'Register'),
                preConfirm: () => {
                    return {
                        name: document.getElementById('swal-company').value,
                        username: document.getElementById('swal-user').value,
                        password: document.getElementById('swal-pass').value
                    }
                }
            });

            if (formValues && formValues.name && formValues.username && formValues.password) {
                const res = await fetch('/api/public/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });
                const r = await res.json();
                if (r.success) {
                    Swal.fire('Success', isHe?'החשבון נוצר! מעבר לדף ההתחברות...':'Account created! Redirecting to login...', 'success').then(() => {
                        window.location.href = 'admin.html';
                    });
                } else {
                    Swal.fire('Error', r.error, 'error');
                }
            }
        }
    