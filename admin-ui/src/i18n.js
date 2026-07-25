import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      "dashboard": "Панель",
      "workers": "Работники",
      "clients": "Клиенты",
      "reports": "Отчеты",
      "invoices": "Счета",
      "leads": "Лиды",
      "logout": "Выход",
      "login_title": "Вход для менеджера",
      "login_btn": "Войти",
      "add_worker": "Добавить работника",
      "add_client": "Добавить клиента",
      "download_excel": "Скачать Отчёт (Excel)",
      "download_pdf": "Скачать Отчёт (PDF)",
      "total_hours": "Всего часов:",
      "overtime": "Сверхурочные:",
      "night_hours": "Ночные:",
      "saturday_hours": "Суббота:",
      "select_month": "Выберите месяц",
      "select_worker": "Выберите работника",
      "select_client": "Выберите клиента",
      "generate": "Сгенерировать",
      "error": "Ошибка",
      "success": "Успешно"
    }
  },
  en: {
    translation: {
      "dashboard": "Dashboard",
      "workers": "Workers",
      "clients": "Clients",
      "reports": "Reports",
      "invoices": "Invoices",
      "leads": "Leads",
      "logout": "Logout",
      "login_title": "Manager Login",
      "login_btn": "Login",
      "add_worker": "Add Worker",
      "add_client": "Add Client",
      "download_excel": "Download Report (Excel)",
      "download_pdf": "Download Report (PDF)",
      "total_hours": "Total Hours:",
      "overtime": "Overtime:",
      "night_hours": "Night Hours:",
      "saturday_hours": "Saturday:",
      "select_month": "Select Month",
      "select_worker": "Select Worker",
      "select_client": "Select Client",
      "generate": "Generate",
      "error": "Error",
      "success": "Success"
    }
  },
  he: {
    translation: {
      "dashboard": "לוח בקרה",
      "workers": "עובדים",
      "clients": "לקוחות",
      "reports": "דוחות",
      "invoices": "חשבוניות",
      "leads": "לידים",
      "logout": "יציאה",
      "login_title": "כניסת מנהל",
      "login_btn": "היכנס",
      "add_worker": "הוסף עובד",
      "add_client": "הוסף לקוח",
      "download_excel": "הורד דוח (Excel)",
      "download_pdf": "הורד דוח (PDF)",
      "total_hours": "סה״כ שעות:",
      "overtime": "שעות נוספות:",
      "night_hours": "שעות לילה:",
      "saturday_hours": "שעות שבת:",
      "select_month": "בחר חודש",
      "select_worker": "בחר עובד",
      "select_client": "בחר לקוח",
      "generate": "הפק",
      "error": "שגיאה",
      "success": "הצלחה"
    }
  },
  ar: {
    translation: {
      "dashboard": "لوحة القيادة",
      "workers": "العمال",
      "clients": "العملاء",
      "reports": "تقارير",
      "invoices": "فواتير",
      "leads": "العملاء المحتملين",
      "logout": "تسجيل خروج",
      "login_title": "تسجيل دخول المدير",
      "login_btn": "دخول",
      "add_worker": "إضافة عامل",
      "add_client": "إضافة عميل",
      "download_excel": "تحميل التقرير (Excel)",
      "download_pdf": "تحميل التقرير (PDF)",
      "total_hours": "إجمالي الساعات:",
      "overtime": "وقت إضافي:",
      "night_hours": "ساعات الليل:",
      "saturday_hours": "ساعات السبت:",
      "select_month": "اختر الشهر",
      "select_worker": "اختر العامل",
      "select_client": "اختر العميل",
      "generate": "توليد",
      "error": "خطأ",
      "success": "نجاح"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('adminLang') || 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
