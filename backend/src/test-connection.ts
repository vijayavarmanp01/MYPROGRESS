import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔄 Verifying users table in MySQL database "myprogressv1"...')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
        progress: {
          select: {
            id: true,
            currentStreak: true,
          },
        },
      },
    })
    
    console.log('✅ Connected successfully!')
    console.log(`📋 Total Users registered in MySQL: ${users.length}`)
    console.table(users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Username: `@${u.username}`,
      Joined: u.createdAt.toISOString(),
      ProgressRecord: u.progress ? `Active (Streak: ${u.progress.currentStreak}d)` : 'None',
    })))
  } catch (error) {
    console.error('❌ Failed to query database users:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
