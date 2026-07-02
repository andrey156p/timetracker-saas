const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

const i18nStart = html.indexOf('const i18n = {');
const i18nEnd = html.indexOf('};', i18nStart) + 2;

if (i18nStart !== -1 && i18nEnd !== -1) {
    const newI18n = `const i18n = {
            ru: {
                loading: "Загрузка профиля...", error_title: "Ошибка доступа",
                worker: "РАБОТНИК", status_ok: "В зоне работы", status_mobile: "Передвижной режим",
                btn_in: "ВХОД", btn_out: "ВЫХОД", current_shift: "Время на смене",
                msg_gps_fetch: "Получение GPS...", msg_sending: "Отправка...",
                msg_in_success: "Смена начата! Удачи.", msg_out_success: "Смена завершена. Отработано: ",
                err_gps: "Нет доступа к GPS", err_network: "Ошибка сети",
                req_gps: "Пожалуйста, включите GPS для начала работы.", req_arrive: "Вам необходимо сначала прибыть на объект. Ваша геопозиция не совпадает.",
                report_btn: "Мои Отчёты", report_title: "Отчёт за месяц", report_total: "Всего часов:",
                report_night: "Ночные часы:", report_sat: "Часы в субботу:", report_over: "Сверхурочные:",
                report_dl: "Скачать Отчёт", close: "Закрыть", error: "Ошибка",
                remind_in: "Не забудьте нажать 'Вход' (смена скоро начнется)!", remind_out: "Не забудьте нажать 'Выход' (смена скоро закончится)!",
                expense_btn: "Расходы / Заметки", expense_title: "Расход / Заметка",
                expense_amt: "Сумма (например 50)", expense_desc: "Описание (на что потрачено)",
                expense_req: "Пожалуйста, введите описание", save: "Сохранить", cancel: "Отмена", saved: "Сохранено"
            },
            en: {
                loading: "Loading profile...", error_title: "Access Error",
                worker: "WORKER", status_ok: "In Work Zone", status_mobile: "Mobile Mode",
                btn_in: "CLOCK IN", btn_out: "CLOCK OUT", current_shift: "Shift Duration",
                msg_gps_fetch: "Fetching GPS...", msg_sending: "Sending...",
                msg_in_success: "Shift started! Good luck.", msg_out_success: "Shift ended. Total time: ",
                err_gps: "GPS access denied", err_network: "Network error",
                req_gps: "Please enable GPS to clock in.", req_arrive: "You must arrive at the workplace first. Your location does not match the site.",
                report_btn: "My Reports", report_title: "Monthly Report", report_total: "Total Hours:",
                report_night: "Night Hours:", report_sat: "Saturday Hours:", report_over: "Overtime:",
                report_dl: "Download Report", close: "Close", error: "Error",
                remind_in: "Don't forget to Clock In (shift starts soon)!", remind_out: "Don't forget to Clock Out (shift ends soon)!",
                expense_btn: "Expenses / Notes", expense_title: "Expense / Note",
                expense_amt: "Amount (e.g. 50)", expense_desc: "Description (what it was for)",
                expense_req: "Please enter a description", save: "Save", cancel: "Cancel", saved: "Saved"
            },
            he: {
                loading: "טוען פרופיל...", error_title: "שגיאת גישה",
                worker: "עובד", status_ok: "באזור העבודה", status_mobile: "מצב נייד",
                btn_in: "כניסה", btn_out: "יציאה", current_shift: "משך משמרת",
                msg_gps_fetch: "מאתר מיקום...", msg_sending: "שולח...",
                msg_in_success: "משמרת התחילה! בהצלחה.", msg_out_success: "משמרת הסתיימה. זמן כולל: ",
                err_gps: "גישה למיקום נדחתה", err_network: "שגיאת רשת",
                req_gps: "אנא אפשר מיקום כדי לדווח כניסה.", req_arrive: "עליך להגיע תחילה לאתר. המיקום שלך לא תואם.",
                report_btn: "הדוחות שלי", report_title: "דוח חודשי", report_total: "סה״כ שעות:",
                report_night: "שעות לילה:", report_sat: "שעות שבת:", report_over: "שעות נוספות:",
                report_dl: "הורד דוח", close: "סגור", error: "שגיאה",
                remind_in: "אל תשכחו לדווח 'כניסה' (המשמרת מתחילה בקרוב)!", remind_out: "אל תשכחו לדווח 'יציאה' (המשמרת מסתיימת בקרוב)!",
                expense_btn: "הוצאות / הערות", expense_title: "הוצאה / הערה",
                expense_amt: "סכום (למשל 50)", expense_desc: "תיאור (על מה שולם)",
                expense_req: "נא להזין תיאור", save: "שמור", cancel: "ביטול", saved: "נשמר"
            },
            ar: {
                loading: "جاري تحميل الملف...", error_title: "خطأ في الوصول",
                worker: "عامل", status_ok: "في منطقة العمل", status_mobile: "وضع متنقل",
                btn_in: "دخول", btn_out: "خروج", current_shift: "مدة الوردية",
                msg_gps_fetch: "جاري تحديد الموقع...", msg_sending: "جاري الإرسال...",
                msg_in_success: "بدأت الوردية! بالتوفيق.", msg_out_success: "انتهت الوردية. إجمالي الوقت: ",
                err_gps: "تم رفض الوصول للموقع", err_network: "خطأ في الشبكة",
                req_gps: "الرجاء تمكين الموقع لتسجيل الدخول.", req_arrive: "يجب أن تصل إلى موقع العمل أولاً.",
                report_btn: "تقاريري", report_title: "التقرير الشهري", report_total: "إجمالي الساعات:",
                report_night: "ساعات الليل:", report_sat: "ساعات السبت:", report_over: "ساعات إضافية:",
                report_dl: "تحميل التقرير", close: "إغلاق", error: "خطأ",
                remind_in: "لا تنس تسجيل الدخول (يبدأ الدوام قريبا)!", remind_out: "لا تنس تسجيل الخروج (ينتهي الدوام قريبا)!",
                expense_btn: "مصاريف / ملاحظات", expense_title: "مصروف / ملاحظة",
                expense_amt: "المبلغ (مثلا 50)", expense_desc: "الوصف (على ماذا أنفق)",
                expense_req: "الرجاء إدخال الوصف", save: "حفظ", cancel: "إلغاء", saved: "تم الحفظ"
            }
        };`;
        
    html = html.substring(0, i18nStart) + newI18n + html.substring(i18nEnd);
    fs.writeFileSync('public/app.html', html, 'utf8');
    console.log('Fixed i18n object in app.html');
} else {
    console.log('Indexes not found!');
}
