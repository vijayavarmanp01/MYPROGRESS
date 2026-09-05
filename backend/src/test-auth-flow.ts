import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:5000/api/auth'

async function runAuthTests() {
  console.log('🧪 Starting End-to-End Authentication Tests against MySQL...\n')

  const testEmail = `test_engineer_${Date.now()}@example.com`
  const testPassword = 'SecurePassword123!'
  const testName = 'Alex Turing'

  let token = ''
  let registeredUserId = ''

  // ─────────────────────────────────────────────────────────────
  // 1. Create a new account (Register)
  // ─────────────────────────────────────────────────────────────
  console.log(`1️⃣ Testing POST /api/auth/register with email: ${testEmail}...`)
  const regRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  })

  const regData: any = await regRes.json()
  if (!regRes.ok || regData.status !== 'success') {
    throw new Error(`Register failed: ${JSON.stringify(regData)}`)
  }
  token = regData.token
  registeredUserId = regData.user.id
  console.log('✅ Registration API succeeded!')
  console.log(`   User ID: ${registeredUserId}`)
  console.log(`   Username: @${regData.user.username}`)
  console.log(`   JWT Token generated: ${token.slice(0, 20)}...\n`)

  // ─────────────────────────────────────────────────────────────
  // 2. Verify the user appears in MySQL Database directly
  // ─────────────────────────────────────────────────────────────
  console.log('2️⃣ Verifying user in MySQL database (users table)...')
  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { progress: true },
  })

  if (!dbUser) {
    throw new Error('❌ User was NOT found in MySQL database!')
  }
  console.log('✅ User verified in MySQL database!')
  console.log(`   Database ID: ${dbUser.id}`)
  console.log(`   Name: ${dbUser.name}`)
  console.log(`   Hashed Password (bcrypt): ${dbUser.passwordHash?.slice(0, 25)}...`)
  console.log(`   Linked Progress Record Created: ${dbUser.progress ? 'Yes (ID: ' + dbUser.progress.id + ')' : 'No'}\n`)

  // ─────────────────────────────────────────────────────────────
  // 3. Login with that account
  // ─────────────────────────────────────────────────────────────
  console.log(`3️⃣ Testing POST /api/auth/login for ${testEmail}...`)
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  })

  const loginData: any = await loginRes.json()
  if (!loginRes.ok || loginData.status !== 'success') {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`)
  }
  token = loginData.token
  console.log('✅ Login API succeeded!')
  console.log(`   Authenticated User: ${loginData.user.name} (@${loginData.user.username})\n`)

  // ─────────────────────────────────────────────────────────────
  // 4. Access /api/auth/me (Protected Route)
  // ─────────────────────────────────────────────────────────────
  console.log('4️⃣ Testing GET /api/auth/me (Protected Route)...')
  const meRes = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const meData: any = await meRes.json()
  if (!meRes.ok || meData.status !== 'success') {
    throw new Error(`GET /me failed: ${JSON.stringify(meData)}`)
  }
  console.log('✅ GET /api/auth/me verified successfully!')
  console.log(`   Current Authenticated User: ${meData.user.name} (${meData.user.email})`)
  console.log(`   Progress Stats: Streak = ${meData.user.progress?.currentStreak} days\n`)

  // ─────────────────────────────────────────────────────────────
  // 4b. Test PUT /api/auth/profile (Update Profile)
  // ─────────────────────────────────────────────────────────────
  console.log('4️⃣b Testing PUT /api/auth/profile...')
  const updateRes = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Alex Turing Updated',
      bio: 'Staff Engineer preparing for L6 system design and advanced DP.',
      targetRole: 'Staff Software Engineer',
      targetCompanies: ['Google', 'DeepMind', 'Anthropic'],
      avatarInitial: 'AT',
      avatarGradient: 'from-[#10b981] to-[#06b6d4]',
    }),
  })

  const updateData: any = await updateRes.json()
  if (!updateRes.ok || updateData.status !== 'success') {
    throw new Error(`PUT /profile failed: ${JSON.stringify(updateData)}`)
  }
  console.log('✅ PUT /api/auth/profile succeeded!')
  console.log(`   Updated Name: ${updateData.user.name}`)
  console.log(`   Updated Target Role: ${updateData.user.targetRole}`)
  console.log(`   Updated Bio: ${updateData.user.bio}`)

  // Verify in MySQL
  const dbUpdated = await prisma.user.findUnique({ where: { email: testEmail } })
  if (dbUpdated?.name !== 'Alex Turing Updated' || dbUpdated?.targetRole !== 'Staff Software Engineer') {
    throw new Error('❌ Profile changes were NOT reflected in MySQL database!')
  }
  console.log('✅ MySQL verification confirmed profile update in users table!\n')

  // ─────────────────────────────────────────────────────────────
  // 5. Test Duplicate Email Prevention (Conflict Check)
  // ─────────────────────────────────────────────────────────────
  console.log('5️⃣ Testing duplicate email registration prevention...')
  const dupRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Alex',
      email: testEmail,
      password: testPassword,
    }),
  })
  const dupData: any = await dupRes.json()
  if (dupRes.status === 409) {
    console.log(`✅ Duplicate registration correctly rejected with 409 Conflict: "${dupData.message}"\n`)
  } else {
    throw new Error(`Expected 409 Conflict, got ${dupRes.status}: ${JSON.stringify(dupData)}`)
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Test Logout
  // ─────────────────────────────────────────────────────────────
  console.log('6️⃣ Testing POST /api/auth/logout...')
  const logoutRes = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
  })
  const logoutData: any = await logoutRes.json()
  if (!logoutRes.ok || logoutData.status !== 'success') {
    throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`)
  }
  console.log('✅ Logout API succeeded!')
  console.log(`   Response: "${logoutData.message}"\n`)

  // ─────────────────────────────────────────────────────────────
  // 7. Verify Protected Route Rejects Unauthenticated Access
  // ─────────────────────────────────────────────────────────────
  console.log('7️⃣ Verifying GET /api/auth/me without token...')
  const unauthRes = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  const unauthData: any = await unauthRes.json()
  if (unauthRes.status === 401) {
    console.log(`✅ Protected route successfully blocked unauthenticated request with 401: "${unauthData.message}"\n`)
  } else {
    throw new Error(`Expected 401, got ${unauthRes.status}`)
  }

  console.log('🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🚀')
}

runAuthTests()
  .catch(err => {
    console.error('❌ Test failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
