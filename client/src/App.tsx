import { useEffect, useMemo, useState } from 'react'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import RunnerDashboard from './pages/RunnerDashboard'
import { User } from './types'
import { apiClient } from './helpers/api'

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'runner'>('landing')

  const isAuthenticated = useMemo(() => !!token, [token])

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return
      try {
        const me = await apiClient('/api/auth/me', 'GET', undefined, token)
        setUser(me.user)
      } catch (err) {
        console.error(err)
        setToken(null)
        setUser(null)
      }
    }
    loadUser()
  }, [token])

  const handleAuth = (jwt: string, user: User) => {
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(user)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setView('landing')
  }

  if (!isAuthenticated && view === 'landing') {
    return <Landing onLogin={() => setView('login')} onRegister={() => setView('register')} />
  }

  if (!isAuthenticated && (view === 'login' || view === 'register')) {
    return (
      <AuthPage
        mode={view}
        onSwitch={() => setView(view === 'login' ? 'register' : 'login')}
        onAuthenticated={handleAuth}
      />
    )
  }

  return (
    <div>
      <nav>
        <div>
          <strong>OnTime Errands</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user?.isRunner && (
            <button className={`tab ${view === 'runner' ? 'active' : ''}`} onClick={() => setView('runner')}>
              Runner
            </button>
          )}
          <button className={`tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            Customer
          </button>
          <button className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      {view === 'dashboard' && user && token && <Dashboard token={token} user={user} />}
      {view === 'runner' && user && token && <RunnerDashboard token={token} user={user} onNeedAuth={() => setView('dashboard')} />}
    </div>
  )
}

export default App
