import { Router } from 'express'
import { JobStatus, JobType, PickupType } from '@prisma/client'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/auth'
import { AuthenticatedRequest } from '../types/request'

const BASE_FEE = 1500
const URGENCY_FEE = 1000
const RUNNER_PAYOUT_SCHEDULED = 900
const RUNNER_PAYOUT_URGENT = 1300

const jobsRouter = Router()

const validateJobPayload = (body: any) => {
  const errors: string[] = []
  if (!body.type || !Object.values(JobType).includes(body.type)) {
    errors.push('type is required')
  }
  if (!body.pickupAddress || !body.dropoffAddress) {
    errors.push('pickupAddress and dropoffAddress are required')
  }
  if (!body.itemDescription) {
    errors.push('itemDescription is required')
  }
  if (!body.pickupName) {
    errors.push('pickupName is required')
  }
  if (!body.dropoffName) {
    errors.push('dropoffName is required')
  }
  if (!body.pickupType || !Object.values(PickupType).includes(body.pickupType)) {
    errors.push('pickupType must be PERSON or BUSINESS')
  }
  if (body.type === JobType.SCHEDULED && !body.scheduledPickupTime) {
    errors.push('scheduledPickupTime is required for scheduled jobs')
  }
  return errors
}

jobsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const errors = validateJobPayload(req.body)
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }

  const type: JobType = req.body.type
  const baseFeeCents = BASE_FEE
  const urgencyFeeCents = type === JobType.URGENT ? URGENCY_FEE : 0
  const totalFeeCents = baseFeeCents + urgencyFeeCents
  const runnerPayoutCents = type === JobType.URGENT ? RUNNER_PAYOUT_URGENT : RUNNER_PAYOUT_SCHEDULED

  const job = await prisma.job.create({
    data: {
      customerId: req.user!.id,
      type,
      status: JobStatus.OPEN,
      pickupType: req.body.pickupType,
      pickupName: req.body.pickupName,
      pickupContactPhone: req.body.pickupContactPhone,
      pickupAddress: req.body.pickupAddress,
      pickupAdditionalInfo: req.body.pickupAdditionalInfo,
      businessOrderNumber: req.body.businessOrderNumber,
      dropoffName: req.body.dropoffName,
      dropoffPhone: req.body.dropoffPhone,
      dropoffAddress: req.body.dropoffAddress,
      dropoffAdditionalInfo: req.body.dropoffAdditionalInfo,
      itemDescription: req.body.itemDescription,
      scheduledPickupTime: type === JobType.SCHEDULED ? new Date(req.body.scheduledPickupTime) : null,
      urgentRequested: type === JobType.URGENT,
      baseFeeCents,
      urgencyFeeCents,
      totalFeeCents,
      customerPaid: false,
      runnerPayoutCents,
      payoutStatus: 'UNPAID'
    }
  })

  return res.status(201).json({ job })
})

jobsRouter.get('/mine', requireAuth, async (req: AuthenticatedRequest, res) => {
  const jobs = await prisma.job.findMany({ where: { customerId: req.user!.id }, orderBy: { createdAt: 'desc' } })
  return res.json({ jobs })
})

jobsRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } })
  if (!job) return res.status(404).json({ message: 'Job not found' })
  if (job.customerId !== req.user!.id && job.runnerId !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  return res.json({ job })
})

jobsRouter.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } })
  if (!job) return res.status(404).json({ message: 'Job not found' })
  if (job.customerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' })
  if (job.status !== JobStatus.OPEN) return res.status(400).json({ message: 'Only open jobs can be cancelled' })

  const updated = await prisma.job.update({ where: { id: job.id }, data: { status: JobStatus.CANCELLED } })
  return res.json({ job: updated })
})

export default jobsRouter
