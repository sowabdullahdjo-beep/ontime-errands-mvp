import { useState } from 'react'
import { apiClient } from '../helpers/api'
import { AuthResponse } from '../types'

interface Props {
  mode: 'login' | 'register'
  onSwitch: () => void
  onAuthenticated: (token: string, user: any) => void
}

const AuthPage = ({ mode, onSwitch, onAuthenticated }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const res = (await apiClient(path, 'POST', payload)) as AuthResponse
      onAuthenticated(res.token, res.user)
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate')
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }} className="card">
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        {mode === 'register' && (
          <label>
            Phone (optional)
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="btn" type="submit">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
      <p>
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
        <button className="btn secondary" onClick={onSwitch}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  )
}

export default AuthPage
