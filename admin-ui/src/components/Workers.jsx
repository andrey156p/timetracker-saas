import { useTranslation } from 'react-i18next'

export default function Workers({ token }) {
  const { t } = useTranslation()
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t('workers')}</h2>
      <p>Worker management interface being ported to React. Please use the classic admin panel for full features temporarily.</p>
    </div>
  )
}
