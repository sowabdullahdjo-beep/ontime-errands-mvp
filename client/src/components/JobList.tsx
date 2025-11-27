import { Job } from '../types'

interface Props {
  jobs: Job[]
  title: string
}

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

const JobList = ({ jobs, title }: Props) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {jobs.length === 0 && <p>No jobs yet.</p>}
      {jobs.map((job) => (
        <div key={job.id} className="list-item">
          <div>
            <strong>{job.type === 'URGENT' ? 'Urgent' : 'Scheduled'}</strong>
            <div>Status: {job.status}</div>
            <div>Pickup: {job.pickupAddress}</div>
            <div>Dropoff: {job.dropoffAddress}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>{formatCurrency(job.totalFeeCents)}</div>
            {job.scheduledPickupTime && <div>{new Date(job.scheduledPickupTime).toLocaleString()}</div>}
            {job.urgentRequested && <div>ASAP</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default JobList
