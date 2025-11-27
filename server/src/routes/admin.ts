import { Router } from 'express'
import { prisma } from '../prisma'
import { requireAdmin, requireAuth } from '../middleware/auth'

const adminRouter = Router()

adminRouter.get('/jobs', requireAuth, requireAdmin, async (_req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } })
  return res.json({ jobs })
})

adminRouter.get('/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return res.json({ users })
})

adminRouter.post('/users/:id/runner-approve', requireAuth, requireAdmin, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) return res.status(404).json({ message: 'User not found' })
  const updated = await prisma.user.update({ where: { id: user.id }, data: { isRunner: !user.isRunner } })
  return res.json({ user: updated })
})

export default adminRouter
