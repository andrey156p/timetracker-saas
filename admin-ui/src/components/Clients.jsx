import { useTranslation } from 'react-i18next'

export default function Clients({ token }) {
  const { t } = useTranslation()
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t('clients')}</h2>
      <p>Client management interface being ported to React. Please use the classic admin panel for full features temporarily.</p>
    </div>
  )
}
