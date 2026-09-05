import { Router, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'

const router = Router()

/** Helper to generate unique username */
async function generateUniqueUsername(base: string): Promise<string> {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20) || 'coder'

  let candidate = sanitized
  let count = 0

  while (count < 10) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    candidate = `${sanitized}${Math.floor(100 + Math.random() * 900)}`
    count++
  }

  return `${sanitized}_${Date.now().toString().slice(-4)}`
}

/** Helper to sign JWT */
function signToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ id: userId, email, role }, secret, { expiresIn } as jwt.SignOptions)
}

/** Helper to set secure auth cookie */
function setAuthCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, username: customUsername } = req.body

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ status: 'error', message: 'Name is required' })
      return
    }

    if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      res.status(400).json({ status: 'error', message: 'Enter a valid email address' })
      return
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      res.status(409).json({
        status: 'error',
        message: 'An account with this email already exists. Please sign in instead.',
      })
      return
    }

    // 3. Generate username
    const initialUsername = customUsername?.trim() || name.trim() || normalizedEmail.split('@')[0]
    const uniqueUsername = await generateUniqueUsername(initialUsername)

    // 4. Hash password securely
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const avatarInitial = (name.trim()[0] || normalizedEmail[0]).toUpperCase()

    // 5. Create user and initial progress in transaction
    const newUser = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          username: uniqueUsername,
          passwordHash,
          avatarInitial,
          avatarGradient: 'from-[#5561f0] to-[#a78bfa]',
          bio: 'Full-stack software engineer preparing for Tier-1 product interviews.',
          targetRole: 'Software Development Engineer (SDE)',
          targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
          provider: 'EMAIL',
          role: 'USER',
        },
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

      // Create linked progress record
      await tx.progress.create({
        data: {
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
          totalProblemsSolved: 0,
          totalTimeSpentMinutes: 0,
          problemsMastered: 0,
          dailyGoalMinutes: 60,
          dailyGoalProblems: 3,
          weeklyGoalProblems: 15,
          overallReadinessPct: 0,
        },
      })

      return user
    })

    // 6. Sign JWT and set cookie
    const token = signToken(newUser.id, newUser.email, newUser.role)
    setAuthCookie(res, token)

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      user: {
        ...newUser,
        provider: 'email',
      },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during registration. Please try again.',
    })
  }
})

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ status: 'error', message: 'Email is required' })
      return
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ status: 'error', message: 'Password is required' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 2. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
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
        progress: {
          select: {
            currentStreak: true,
            longestStreak: true,
            totalProblemsSolved: true,
            overallReadinessPct: true,
          },
        },
      },
    })

    if (!user || !user.passwordHash) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password. Please check your credentials.',
      })
      return
    }

    // 3. Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password. Please check your credentials.',
      })
      return
    }

    // 4. Exclude passwordHash from response
    const { passwordHash: _, ...safeUser } = user

    // 5. Sign JWT and set cookie
    const token = signToken(safeUser.id, safeUser.email, safeUser.role)
    setAuthCookie(res, token)

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        ...safeUser,
        provider: safeUser.provider.toLowerCase() as 'email' | 'google' | 'github',
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during login. Please try again.',
    })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me (Protected Route)
// ─────────────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' })
      return
    }

    // Fetch user with progress stats
    const userWithProgress = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        progress: {
          select: {
            currentStreak: true,
            longestStreak: true,
            totalProblemsSolved: true,
            totalTimeSpentMinutes: true,
            problemsMastered: true,
            overallReadinessPct: true,
          },
        },
      },
    })

    if (!userWithProgress) {
      res.status(404).json({ status: 'error', message: 'User not found' })
      return
    }

    res.status(200).json({
      status: 'success',
      user: {
        ...userWithProgress,
        provider: userWithProgress.provider.toLowerCase() as 'email' | 'google' | 'github',
      },
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user profile.',
    })
  }
})

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/profile (Protected Route)
// ─────────────────────────────────────────────────────────────
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' })
      return
    }

    const {
      name,
      username,
      bio,
      avatarInitial,
      avatarGradient,
      githubUrl,
      linkedinUrl,
      leetcodeUrl,
      targetRole,
      targetCompanies,
    } = req.body

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ status: 'error', message: 'Name cannot be empty' })
        return
      }
      updateData.name = name.trim()
    }

    if (username !== undefined) {
      if (typeof username !== 'string' || !username.trim()) {
        res.status(400).json({ status: 'error', message: 'Username cannot be empty' })
        return
      }
      const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (!sanitized) {
        res.status(400).json({ status: 'error', message: 'Username must contain alphanumeric characters' })
        return
      }

      // Check if another user already owns this username
      const existing = await prisma.user.findFirst({
        where: {
          username: sanitized,
          NOT: { id: req.user.id },
        },
      })

      if (existing) {
        res.status(409).json({ status: 'error', message: 'Username is already taken. Please choose another.' })
        return
      }

      updateData.username = sanitized
    }

    if (bio !== undefined) updateData.bio = typeof bio === 'string' ? bio.trim() : null
    if (avatarInitial !== undefined) updateData.avatarInitial = typeof avatarInitial === 'string' ? avatarInitial.trim().slice(0, 2).toUpperCase() : null
    if (avatarGradient !== undefined) updateData.avatarGradient = typeof avatarGradient === 'string' ? avatarGradient.trim() : null
    if (githubUrl !== undefined) updateData.githubUrl = typeof githubUrl === 'string' ? githubUrl.trim() : null
    if (linkedinUrl !== undefined) updateData.linkedinUrl = typeof linkedinUrl === 'string' ? linkedinUrl.trim() : null
    if (leetcodeUrl !== undefined) updateData.leetcodeUrl = typeof leetcodeUrl === 'string' ? leetcodeUrl.trim() : null
    if (targetRole !== undefined) updateData.targetRole = typeof targetRole === 'string' ? targetRole.trim() : null
    if (targetCompanies !== undefined) {
      updateData.targetCompanies = Array.isArray(targetCompanies) ? targetCompanies : []
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
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
        progress: {
          select: {
            currentStreak: true,
            longestStreak: true,
            totalProblemsSolved: true,
            totalTimeSpentMinutes: true,
            problemsMastered: true,
            overallReadinessPct: true,
          },
        },
      },
    })

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        provider: updatedUser.provider.toLowerCase() as 'email' | 'google' | 'github',
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user profile. Please try again.',
    })
  }
})

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
router.post('/logout', (_req: AuthRequest, res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  })

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  })
})

export default router
