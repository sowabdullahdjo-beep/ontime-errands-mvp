const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:4000'

export const apiClient = async (path: string, method: string = 'GET', body?: any, token?: string) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  return res.json()
}
