import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/auth'
import { AuthenticatedRequest } from '../types/request'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash, phone } })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, isRunner: user.isRunner, isAdmin: user.isAdmin } })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, isRunner: user.isRunner, isAdmin: user.isAdmin } })
})

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user })
})

export default authRouter
