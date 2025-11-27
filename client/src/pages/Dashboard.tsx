import { useEffect, useState } from 'react'
import JobForm from '../components/JobForm'
import JobList from '../components/JobList'
import { Job, User } from '../types'
import { apiClient } from '../helpers/api'

interface Props {
  token: string
  user: User
}

const Dashboard = ({ token }: Props) => {
  const [jobs, setJobs] = useState<Job[]>([])

  const loadJobs = async () => {
    const res = await apiClient('/api/jobs/mine', 'GET', undefined, token)
    setJobs(res.jobs)
  }

  useEffect(() => {
    loadJobs()
  }, [])

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <div className="tabs">
        <div className="tab active">Create Errand</div>
      </div>
      <JobForm token={token} onCreated={loadJobs} />
      <div style={{ marginTop: 16 }}>
        <JobList title="My errands" jobs={jobs} />
      </div>
    </div>
  )
}

export default Dashboard
