import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Navbar({ setToken }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    setToken(null)
    navigate('/login')
  }

  const changeLang = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('adminLang', lng)
    document.documentElement.dir = lng === 'he' || lng === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center mb-6">
      <div className="flex gap-4 font-bold">
        <Link to="/">{t('dashboard')}</Link>
        <Link to="/workers">{t('workers')}</Link>
        <Link to="/clients">{t('clients')}</Link>
        <Link to="/reports">{t('reports')}</Link>
      </div>
      <div className="flex gap-4 items-center">
        <select 
          className="text-black p-1 rounded" 
          value={i18n.language} 
          onChange={e => changeLang(e.target.value)}
        >
          <option value="ru">RU</option>
          <option value="en">EN</option>
          <option value="he">HE</option>
          <option value="ar">AR</option>
        </select>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
          {t('logout')}
        </button>
      </div>
    </nav>
  )
}
