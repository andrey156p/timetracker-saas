import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import axios from 'axios'
import Swal from 'sweetalert2'

export default function Reports({ token }) {
  const { t } = useTranslation()
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [month, setMonth] = useState('')

  useEffect(() => {
    axios.get('/api/admin/workers', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWorkers(res.data.data || []))
      .catch(console.error)
  }, [token])

  const generateExcel = async () => {
    if (!selectedWorker || !month) return Swal.fire(t('error'), 'Select worker and month', 'error');
    try {
      const res = await axios.get(`/api/admin/report?empId=${selectedWorker}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.data.success) throw new Error(res.data.error)
      
      const { dailyData, totals, workerName } = res.data
      
      const wsData = [
        [t('date'), t('total_hours')]
      ]
      
      Object.keys(dailyData).forEach(date => {
        const hrs = Math.floor(dailyData[date] / 3600)
        const mins = Math.floor((dailyData[date] % 3600) / 60)
        wsData.push([date, `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}`])
      })
      
      wsData.push(['', ''])
      wsData.push([t('total_hours'), Math.floor(totals.totalHours/3600)])
      wsData.push([t('overtime'), Math.floor(totals.overtimeHours/3600)])
      wsData.push([t('night_hours'), Math.floor(totals.nightHours/3600)])
      wsData.push([t('saturday_hours'), Math.floor(totals.saturdayHours/3600)])
      
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Report")
      
      XLSX.writeFile(wb, `Report_${workerName}_${month}.xlsx`)
      Swal.fire(t('success'), 'Excel downloaded', 'success')
    } catch (e) {
      Swal.fire(t('error'), e.message || 'Error', 'error')
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t('reports')}</h2>
      <div className="flex gap-4 mb-4">
        <select className="border p-2 rounded" value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
          <option value="">{t('select_worker')}</option>
          {workers.map(w => <option key={w.id} value={w.empId}>{w.name}</option>)}
        </select>
        <input type="month" className="border p-2 rounded" value={month} onChange={e => setMonth(e.target.value)} />
      </div>
      <button onClick={generateExcel} className="bg-green-600 text-white px-4 py-2 rounded">
        {t('download_excel')}
      </button>
    </div>
  )
}
