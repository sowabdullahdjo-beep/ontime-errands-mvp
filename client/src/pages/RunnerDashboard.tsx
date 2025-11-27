import { useEffect, useState } from 'react'
import { Job, JobStatus, User } from '../types'
import { apiClient } from '../helpers/api'

interface Props {
  token: string
  user: User
  onNeedAuth: () => void
}

const RunnerDashboard = ({ token }: Props) => {
  const [openJobs, setOpenJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [earnings, setEarnings] = useState(0)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const open = await apiClient('/api/runner/jobs/open', 'GET', undefined, token)
      const mine = await apiClient('/api/runner/jobs/mine', 'GET', undefined, token)
      const earn = await apiClient('/api/runner/earnings', 'GET', undefined, token)
      setOpenJobs(open.jobs)
      setMyJobs(mine.jobs)
      setEarnings(earn.totalCents)
    } catch (err: any) {
      setError(err.message || 'Unable to load runner data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const acceptJob = async (id: string) => {
    await apiClient(`/api/runner/jobs/${id}/accept`, 'POST', undefined, token)
    loadData()
  }

  const updateStatus = async (id: string, status: JobStatus) => {
    await apiClient(`/api/runner/jobs/${id}/status`, 'POST', { status }, token)
    loadData()
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <h2>Runner dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <h3>Open jobs</h3>
        {openJobs.length === 0 && <p>No open jobs yet.</p>}
        {openJobs.map((job) => (
          <div key={job.id} className="list-item">
            <div>
              <strong>{job.type}</strong>
              <div>Pickup: {job.pickupAddress}</div>
              <div>Dropoff: {job.dropoffAddress}</div>
            </div>
            <div>
              <div>Payout ${(job.runnerPayoutCents / 100).toFixed(2)}</div>
              <button className="btn" onClick={() => acceptJob(job.id)}>
                Accept job
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>My jobs</h3>
        {myJobs.length === 0 && <p>No jobs yet.</p>}
        {myJobs.map((job) => (
          <div key={job.id} className="list-item">
            <div>
              <strong>{job.type}</strong> – {job.status}
              <div>{job.pickupAddress}</div>
              <div>{job.dropoffAddress}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {job.status === 'ASSIGNED' && (
                <button className="btn" onClick={() => updateStatus(job.id, 'IN_PICKUP')}>
                  Start pickup
                </button>
              )}
              {job.status === 'IN_PICKUP' && (
                <button className="btn" onClick={() => updateStatus(job.id, 'IN_TRANSIT')}>
                  Start delivery
                </button>
              )}
              {job.status === 'IN_TRANSIT' && (
                <button className="btn" onClick={() => updateStatus(job.id, 'DELIVERED')}>
                  Mark delivered
                </button>
              )}
              {["ASSIGNED", "IN_PICKUP", "IN_TRANSIT"].includes(job.status) && (
                <button className="btn secondary" onClick={() => updateStatus(job.id, 'FAILED')}>
                  Mark failed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Earnings</h3>
        <p>Total delivered payout: ${(earnings / 100).toFixed(2)}</p>
      </div>
    </div>
  )
}

export default RunnerDashboard
