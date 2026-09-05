import express, { type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { prisma } from './db.js'
import authRoutes from './routes/auth.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true) // Allow in dev
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// Mount API Routes
app.use('/api/auth', authRoutes)

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbCheck = await prisma.$queryRaw`SELECT 1 AS status, DATABASE() AS database_name`
    res.json({
      status: 'ok',
      message: 'MyProgress backend service is operational',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        details: dbCheck,
      },
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Basic root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'MyProgress Backend API',
    version: '1.0.0',
    status: 'ready',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
    },
  })
})

export { app }

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 MyProgress backend server running on http://localhost:${PORT}`)
    console.log(`📡 Health check available at http://localhost:${PORT}/health`)
  })
}
