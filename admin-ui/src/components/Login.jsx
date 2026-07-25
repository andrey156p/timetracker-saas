import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import Swal from 'sweetalert2'

export default function Login({ setToken }) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/admin/login', { password })
      if (res.data.success) {
        setToken(res.data.token)
      } else {
        Swal.fire(t('error'), 'Invalid password', 'error')
      }
    } catch (err) {
      Swal.fire(t('error'), 'Login failed', 'error')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('login_title')}</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Password"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">
          {t('login_btn')}
        </button>
      </form>
    </div>
  )
}
