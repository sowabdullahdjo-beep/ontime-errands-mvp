import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { AuthenticatedRequest } from '../types/request'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.user = user
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

export const requireRunner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isRunner) {
    return res.status(403).json({ message: 'Runner access required' })
  }
  return next()
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' })
  }
  return next()
}
