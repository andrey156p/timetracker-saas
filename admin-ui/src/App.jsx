import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Dashboard from './components/Dashboard'
import Workers from './components/Workers'
import Clients from './components/Clients'
import Reports from './components/Reports'
import Login from './components/Login'
import Navbar from './components/Navbar'
import './i18n'

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const { t } = useTranslation()

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token)
    } else {
      localStorage.removeItem('adminToken')
    }
  }, [token])

  return (
    <Router basename="/react-admin">
      {token && <Navbar setToken={setToken} />}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
          <Route path="/workers" element={token ? <Workers token={token} /> : <Navigate to="/login" />} />
          <Route path="/clients" element={token ? <Clients token={token} /> : <Navigate to="/login" />} />
          <Route path="/reports" element={token ? <Reports token={token} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
