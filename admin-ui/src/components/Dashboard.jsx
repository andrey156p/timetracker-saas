import { useTranslation } from 'react-i18next'

export default function Dashboard({ token }) {
  const { t } = useTranslation()
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t('dashboard')}</h2>
      <p>Welcome to the new React-based Admin Panel. Use the Reports tab to generate proper Excel files.</p>
      <br/>
      <a href="/admin.html" className="text-blue-600 underline">Switch back to Classic Admin Panel</a>
    </div>
  )
}
