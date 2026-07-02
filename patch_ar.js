const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

const arDict = `    },
    ar: {
        username: "اسم المستخدم", password: "كلمة المرور", login_btn: "تسجيل الدخول", logout: "تسجيل خروج",
        login_title: "مرحباً", login_subtitle: "أدخل بياناتك لتسجيل الدخول", login_desc: "تتبع الوقت لعملك",
        tab_owner_clients: "إدارة المديرين", tab_owner_billing: "الفواتير", tab_owner_leads: "الطلبات", tab_owner_invoices: "الفواتير", tab_owner_pass: "تغيير كلمة المرور",
        tab_client_workers: "العمال", tab_client_shifts: "الورديات",
        add_foreman: "إنشاء مدير", foreman_name: "الاسم", foreman_login: "اسم المستخدم", foreman_pass: "كلمة المرور",
        save: "حفظ", action: "إجراء", block: "حظر", unblock: "إلغاء الحظر",
        period: "الفترة", from: "من", to: "إلى", load: "تحميل", clear_btn: "مسح البيانات", all_workers: "جميع العمال",
        workers: "العمال", hours: "إجمالي الساعات", active: "نشط", old_pass: "كلمة المرور القديمة", new_pass: "كلمة المرور الجديدة",
        add_worker: "إضافة عامل", worker_name: "الاسم", lat: "خط العرض", lng: "خط الطول", rad: "نصف القطر",
        mobile: "جوال (بدون GPS)", link: "رابط العمال:", copy: "نسخ", delete: "حذف",
        geocode: "الحصول على العنوان", address: "العنوان", get_my_loc: "موقعي",
        matrix_title: "جدول الورديات (أسبوعي)", global_shifts: "أوقات الورديات (عام)",
        morning: "صباح", evening: "مساء", night: "ليل",
        d_sun: "الأحد", d_mon: "الاثنين", d_tue: "الثلاثاء", d_wed: "الأربعاء", d_thu: "الخميس", d_fri: "الجمعة", d_sat: "السبت",
        off: "- عطلة -", hours_worked: "ساعات عمل العمال", choose_period: "اختر الفترة...", no_workers: "لا يوجد عمال", loading: "جاري التحميل...",
        date: "التاريخ", id: "الرقم", night_hours: "ليلية", saturday_hours: "السبت", overtime_hours: "إضافي", deleted_worker: "عامل محذوف",
        status: "الحالة", print: "طباعة", paid: "مدفوع", pending: "قيد الانتظار", total_sum_hours: "إجمالي الساعات:", download_report: "تحميل التقرير (Excel)", shift_times: "دخول/خروج",
        qr_print: "QR / طباعة", copy_link: "نسخ الرابط", reset_pass: "كلمة المرور", tariff: "التعرفة",
        per_hour: "بالساعة", per_worker: "بالعامل يومياً", block_btn: "حظر", unblock_btn: "إلغاء الحظر", copied: "تم النسخ!",
        qr_scan_text: "امسح هذا الرمز بكاميرا هاتفك لتثبيت تطبيق تتبع الوقت.",
        edit: "تعديل", indiv_shifts: "ورديات فردية (فارغ = عام)", save_changes: "حفظ التغييرات", cancel: "إلغاء", unlock_trial: "إزالة القيود", delete_client: "حذف العميل",
        tab_owner_hierarchy: "الهيكلية", tab_client_foremen: "المديرون", tab_client_analytics: "التحليلات"
    }
};`;

admin = admin.replace(/    \}\n\};\n/, arDict + '\n');

admin = admin.replace(
    "} else if (browserLang.startsWith('he') || browserLang.startsWith('ar')) {\n    currentLang = 'he';",
    "} else if (browserLang.startsWith('he')) {\n    currentLang = 'he';\n} else if (browserLang.startsWith('ar')) {\n    currentLang = 'ar';"
);

fs.writeFileSync('public/admin.js', admin, 'utf8');

// For app.html, let's also make sure RTL is applied for Arabic.
let appHtml = fs.readFileSync('public/app.html', 'utf8');
appHtml = appHtml.replace(
    "if (currentLang === 'he') {",
    "if (currentLang === 'he' || currentLang === 'ar') {"
);
fs.writeFileSync('public/app.html', appHtml, 'utf8');

console.log('Added Arabic dict and logic');
