import { Router } from 'express'
import { PaymentStatus } from '@prisma/client'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/auth'
import { AuthenticatedRequest } from '../types/request'

const paymentsRouter = Router()

paymentsRouter.post('/jobs/:id/pay', requireAuth, async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } })
  if (!job) return res.status(404).json({ message: 'Job not found' })
  if (job.customerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' })

  const payment = await prisma.payment.create({
    data: {
      jobId: job.id,
      customerId: req.user!.id,
      provider: 'stripe_test',
      providerPaymentId: `test_${job.id}`,
      amountCents: job.totalFeeCents,
      status: PaymentStatus.COMPLETED
    }
  })

  const updatedJob = await prisma.job.update({ where: { id: job.id }, data: { customerPaid: true } })
  return res.json({ payment, job: updatedJob })
})

export default paymentsRouter
