import { useState } from 'react'
import { JobType, PickupType, Job } from '../types'
import { apiClient } from '../helpers/api'

interface Props {
  token: string
  onCreated: (job: Job) => void
}

const initialState = {
  type: 'SCHEDULED' as JobType,
  pickupType: 'PERSON' as PickupType,
  pickupName: '',
  pickupContactPhone: '',
  pickupAddress: '',
  pickupAdditionalInfo: '',
  businessOrderNumber: '',
  dropoffName: '',
  dropoffPhone: '',
  dropoffAddress: '',
  dropoffAdditionalInfo: '',
  itemDescription: '',
  scheduledPickupTime: ''
}

const JobForm = ({ token, onCreated }: Props) => {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalFee = form.type === 'URGENT' ? 25 : 15

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        scheduledPickupTime: form.type === 'SCHEDULED' ? form.scheduledPickupTime : null
      }
      const res = await apiClient('/api/jobs', 'POST', payload, token)
      await apiClient(`/api/jobs/${res.job.id}/pay`, 'POST', undefined, token)
      onCreated(res.job)
      setForm(initialState)
    } catch (err: any) {
      setError(err.message || 'Could not create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Create errand</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <label>
            Job type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as JobType })}>
              <option value="SCHEDULED">Scheduled pickup</option>
              <option value="URGENT">Urgent pickup (ASAP)</option>
            </select>
          </label>
          <label>
            Pickup from
            <select value={form.pickupType} onChange={(e) => setForm({ ...form, pickupType: e.target.value as PickupType })}>
              <option value="PERSON">Person</option>
              <option value="BUSINESS">Business (already paid)</option>
            </select>
          </label>
        </div>
        <div className="grid-2">
          <label>
            Pickup name / order name
            <input value={form.pickupName} onChange={(e) => setForm({ ...form, pickupName: e.target.value })} required />
          </label>
          {form.pickupType === 'BUSINESS' ? (
            <label>
              Order number (optional)
              <input value={form.businessOrderNumber} onChange={(e) => setForm({ ...form, businessOrderNumber: e.target.value })} />
            </label>
          ) : (
            <label>
              Pickup contact phone
              <input value={form.pickupContactPhone} onChange={(e) => setForm({ ...form, pickupContactPhone: e.target.value })} />
            </label>
          )}
        </div>
        <label>
          Pickup address
          <input value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} required />
        </label>
        <label>
          Pickup instructions
          <input value={form.pickupAdditionalInfo} onChange={(e) => setForm({ ...form, pickupAdditionalInfo: e.target.value })} />
        </label>
        <div className="grid-2">
          <label>
            Dropoff name
            <input value={form.dropoffName} onChange={(e) => setForm({ ...form, dropoffName: e.target.value })} required />
          </label>
          <label>
            Dropoff phone (optional)
            <input value={form.dropoffPhone} onChange={(e) => setForm({ ...form, dropoffPhone: e.target.value })} />
          </label>
        </div>
        <label>
          Dropoff address
          <input value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} required />
        </label>
        <label>
          Dropoff instructions
          <input
            value={form.dropoffAdditionalInfo}
            onChange={(e) => setForm({ ...form, dropoffAdditionalInfo: e.target.value })}
          />
        </label>
        <label>
          Item description
          <textarea value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} required />
        </label>
        {form.type === 'SCHEDULED' && (
          <label>
            Scheduled pickup time
            <input
              type="datetime-local"
              value={form.scheduledPickupTime}
              onChange={(e) => setForm({ ...form, scheduledPickupTime: e.target.value })}
              required
            />
          </label>
        )}
        {form.type === 'URGENT' && <div className="card">ASAP – a runner will be dispatched shortly.</div>}
        <div className="card" style={{ background: '#ecfeff' }}>
          <strong>Pricing</strong>
          <p>Base fee: $15.00 CAD</p>
          {form.type === 'URGENT' && <p>Urgency add-on: $10.00 CAD</p>}
          <p>Total: ${totalFee}.00 CAD</p>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Confirm & Pay'}
        </button>
      </form>
    </div>
  )
}

export default JobForm
