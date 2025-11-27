import { Router } from 'express'
import { JobStatus } from '@prisma/client'
import { prisma } from '../prisma'
import { requireAuth, requireRunner } from '../middleware/auth'
import { AuthenticatedRequest } from '../types/request'

const runnerRouter = Router()

const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  OPEN: [JobStatus.ASSIGNED],
  ASSIGNED: [JobStatus.IN_PICKUP, JobStatus.FAILED],
  IN_PICKUP: [JobStatus.IN_TRANSIT, JobStatus.FAILED],
  IN_TRANSIT: [JobStatus.DELIVERED, JobStatus.FAILED],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: []
}

runnerRouter.get('/jobs/open', requireAuth, requireRunner, async (_req, res) => {
  const jobs = await prisma.job.findMany({ where: { status: JobStatus.OPEN, customerPaid: true }, orderBy: { createdAt: 'desc' } })
  return res.json({ jobs })
})

runnerRouter.post('/jobs/:id/accept', requireAuth, requireRunner, async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } })
  if (!job) return res.status(404).json({ message: 'Job not found' })
  if (!job.customerPaid) return res.status(400).json({ message: 'Job must be paid before acceptance' })
  if (job.status !== JobStatus.OPEN) return res.status(400).json({ message: 'Job already assigned' })

  const updated = await prisma.job.update({ where: { id: job.id }, data: { status: JobStatus.ASSIGNED, runnerId: req.user!.id } })
  return res.json({ job: updated })
})

runnerRouter.post('/jobs/:id/status', requireAuth, requireRunner, async (req: AuthenticatedRequest, res) => {
  const { status, failureReason } = req.body as { status: JobStatus; failureReason?: string }
  const job = await prisma.job.findUnique({ where: { id: req.params.id } })
  if (!job) return res.status(404).json({ message: 'Job not found' })
  if (job.runnerId !== req.user!.id) return res.status(403).json({ message: 'Not your job' })

  if (!allowedTransitions[job.status].includes(status)) {
    return res.status(400).json({ message: 'Invalid status transition' })
  }

  const data: any = { status }
  if (status === JobStatus.FAILED) {
    data.failureReason = failureReason || 'Not specified'
  }
  if (status === JobStatus.DELIVERED) {
    data.payoutStatus = 'PAID'
  }

  const updated = await prisma.job.update({ where: { id: job.id }, data })
  return res.json({ job: updated })
})

runnerRouter.get('/jobs/mine', requireAuth, requireRunner, async (req: AuthenticatedRequest, res) => {
  const jobs = await prisma.job.findMany({ where: { runnerId: req.user!.id }, orderBy: { createdAt: 'desc' } })
  return res.json({ jobs })
})

runnerRouter.get('/earnings', requireAuth, requireRunner, async (req: AuthenticatedRequest, res) => {
  const jobs = await prisma.job.findMany({ where: { runnerId: req.user!.id, status: JobStatus.DELIVERED } })
  const total = jobs.reduce((acc, job) => acc + job.runnerPayoutCents, 0)
  return res.json({ totalCents: total, jobs })
})

export default runnerRouter
