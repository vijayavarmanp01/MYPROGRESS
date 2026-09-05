import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    username: string
    role: string
    bio: string | null
    avatarInitial: string | null
    avatarGradient: string | null
    githubUrl: string | null
    linkedinUrl: string | null
    leetcodeUrl: string | null
    targetRole: string | null
    targetCompanies: unknown
    provider: string
    createdAt: Date
    updatedAt: Date
  }
}

interface JwtPayload {
  id: string
  email: string
  role: string
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined
  const tokenFromCookie = req.cookies?.token

  const token = tokenFromHeader || tokenFromCookie

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. No token provided.',
    })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('FATAL: JWT_SECRET is not configured in .env')
    res.status(500).json({
      status: 'error',
      message: 'Internal server authentication configuration error',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        bio: true,
        avatarInitial: true,
        avatarGradient: true,
        githubUrl: true,
        linkedinUrl: true,
        leetcodeUrl: true,
        targetRole: true,
        targetCompanies: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid session. User no longer exists.',
      })
      return
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Session expired. Please log in again.',
      })
      return
    }

    res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token.',
    })
  }
}
