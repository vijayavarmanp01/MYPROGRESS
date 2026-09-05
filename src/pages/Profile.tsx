import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Trophy,
  Clock,
  Target,
  Check,
  Edit3,
  Code2,
  ExternalLink,
  TrendingUp,
  Calendar,
  Lock,
  Share2,
  Briefcase,
  Zap,
  LogOut,
} from 'lucide-react'
import { useAuth, type AuthUser } from '../store/AuthContext'
import { useApp } from '../store/AppContext'
import { getTodayStats, getOverallCompletion, getWeeklySummary } from '../lib/analytics'
import { formatDisplayDate, cn } from '../lib/utils'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CircularProgress } from '../components/ui/CircularProgress'

/* ─── Social SVG Icons ───────────────────────────────────── */
function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 0 0 1.66-1.66 1.66 1.66 0 0 0-1.66-1.66 1.65 1.65 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACHIEVEMENT BADGES DATA
   ═══════════════════════════════════════════════════════════ */

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlocked: boolean
  progress: number
  max: number
  dateUnlocked?: string
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-50',
    title: 'First 50 Problems',
    description: 'Solve 50 algorithm problems across any DSA category',
    icon: '🏆',
    tier: 'bronze',
    unlocked: true,
    progress: 50,
    max: 50,
    dateUnlocked: 'Aug 14, 2026',
  },
  {
    id: '7-streak',
    title: '7 Day Streak',
    description: 'Maintain an unbroken daily coding streak for a week',
    icon: '🔥',
    tier: 'bronze',
    unlocked: true,
    progress: 7,
    max: 7,
    dateUnlocked: 'Yesterday',
  },
  {
    id: 'century-100',
    title: 'Century Club (100+)',
    description: 'Cross the triple-digit threshold of 100 solved problems',
    icon: '⚡',
    tier: 'silver',
    unlocked: true,
    progress: 124,
    max: 100,
    dateUnlocked: '3 days ago',
  },
  {
    id: 'sql-specialist',
    title: 'SQL Specialist',
    description: 'Master 15+ Advanced Window Functions & CTE queries',
    icon: '🪟',
    tier: 'silver',
    unlocked: true,
    progress: 18,
    max: 15,
    dateUnlocked: 'Aug 22, 2026',
  },
  {
    id: 'dp-master',
    title: 'DP Grandmaster',
    description: 'Solve 25 Dynamic Programming challenges (Knapsack, Memoization)',
    icon: '🧠',
    tier: 'gold',
    unlocked: false,
    progress: 18,
    max: 25,
  },
  {
    id: 'interview-ready',
    title: 'Interview Ready (80%+)',
    description: 'Achieve 80%+ mastery across Core DSA, SQL & System Design',
    icon: '🎯',
    tier: 'gold',
    unlocked: false,
    progress: 68,
    max: 80,
  },
  {
    id: 'streak-guardian',
    title: 'Streak Guardian (30d)',
    description: 'Maintain continuous practice for 30 consecutive days',
    icon: '🛡️',
    tier: 'platinum',
    unlocked: false,
    progress: 7,
    max: 30,
  },
  {
    id: 'tree-surgeon',
    title: 'Tree & Graph Surgeon',
    description: 'Solve 40 problems on Trees, BSTs, Graphs, and BFS/DFS',
    icon: '🌳',
    tier: 'silver',
    unlocked: true,
    progress: 42,
    max: 40,
    dateUnlocked: 'Aug 28, 2026',
  },
]

/* ═══════════════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function ProfilePage() {
  const { user, updateUser, signOut } = useAuth()
  const { state, today } = useApp()
  const navigate = useNavigate()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [topicFilter, setTopicFilter] = useState<'all' | 'in-progress' | 'mastered' | 'weak'>('all')
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<string | null>(null)
  const [copiedToast, setCopiedToast] = useState(false)

  // Compute live user stats from app state
  const stats = getTodayStats(state, today)
  const overallCompletion = getOverallCompletion(state)
  const summary = useMemo(() => getWeeklySummary(state), [state])

  // Problem counts from state
  const solvedProblems = state.problems.filter(p => p.status === 'solved' || p.status === 'revised')
  const totalSolvedCount = solvedProblems.length || 124

  const easyCount = state.problems.filter(p => p.difficulty === 'easy' && (p.status === 'solved' || p.status === 'revised')).length || 54
  const mediumCount = state.problems.filter(p => p.difficulty === 'medium' && (p.status === 'solved' || p.status === 'revised')).length || 58
  const hardCount = state.problems.filter(p => p.difficulty === 'hard' && (p.status === 'solved' || p.status === 'revised')).length || 12

  // Heatmap generation
  const heatmapData = useMemo(() => {
    const data = []
    const now = new Date()
    for (let i = 180; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const rec = state.dayRecords[dateStr]
      const count = rec?.totalProblems ?? (i < 14 ? (i % 3 === 0 ? 3 : 2) : i % 5 === 0 ? 1 : 0)
      data.push({
        day: i,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
      })
    }
    return data
  }, [state.dayRecords])

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return state.categories.filter(cat => {
      const target = Math.max(1, cat.totalProblemsPlanned)
      const pct = Math.round((cat.problemsSolved / target) * 100)
      if (topicFilter === 'mastered') return pct >= 75
      if (topicFilter === 'in-progress') return pct > 0 && pct < 75
      if (topicFilter === 'weak') return pct < 45
      return true
    })
  }, [state.categories, topicFilter])

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedToast(true)
    setTimeout(() => setCopiedToast(false), 2200)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const avatarGradient = user?.avatarGradient || 'from-[#5561f0] to-[#a78bfa]'

  return (
    <div className="space-y-8 animate-fade-up pb-16">

      {/* ════════════════════════════════════════════════════════
          1. HERO HEADER — DEVELOPER IDENTITY
      ════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/80 p-6 sm:p-9 shadow-card backdrop-blur-xl">
        
        {/* Ambient Top Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, #a78bfa 50%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          
          {/* Avatar + Main Identity Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Avatar with Glow Ring & Status Badge */}
            <div className="relative group shrink-0">
              <div
                className={cn(
                  'flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl sm:text-4xl font-extrabold text-white shadow-lift ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-105',
                  avatarGradient
                )}
              >
                {user?.avatarInitial || (user?.name ? user.name[0].toUpperCase() : 'U')}
              </div>

              {/* Online / Active Badge */}
              <span
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-surface border-2 border-surface shadow-sm"
                title="Active Streak"
              >
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>

            {/* Identity Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                  {user?.name || 'Developer'}
                </h1>
                <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-0.5 text-xs font-mono font-semibold text-accent">
                  @{user?.username || 'developer'}
                </span>
                <span className="rounded-full border border-amber/30 bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-amber flex items-center gap-1">
                  <Flame size={12} />
                  {state.streak.current} Day Streak
                </span>
              </div>

              <p className="text-sm font-medium text-ink-2 flex items-center gap-2">
                <Briefcase size={14} className="text-ink-3" />
                <span>{user?.targetRole || 'Software Development Engineer II (SDE-2 Candidate)'}</span>
              </p>

              <p className="max-w-xl text-xs sm:text-[13.5px] leading-relaxed text-ink-3">
                {user?.bio || 'Full-stack software engineer preparing for Tier-1 product interviews. Focused on Dynamic Programming, Graphs & Scalable System Design.'}
              </p>

              {/* Links & Social Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-ink-2 hover:border-accent hover:text-ink transition-colors font-mono"
                  >
                    <GitHubIcon size={13} />
                    <span>GitHub</span>
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                )}
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-ink-2 hover:border-accent hover:text-ink transition-colors font-mono"
                  >
                    <LinkedInIcon size={13} />
                    <span>LinkedIn</span>
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                )}
                {user?.leetcodeUrl && (
                  <a
                    href={user.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-ink-2 hover:border-accent hover:text-ink transition-colors font-mono"
                  >
                    <Code2 size={13} />
                    <span>LeetCode</span>
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                )}

                {/* Target Company Badges */}
                <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-line font-mono text-[11px] text-ink-3">
                  <span>Target:</span>
                  {(user?.targetCompanies || ['Google', 'Meta', 'Stripe']).map((comp, idx) => (
                    <span key={idx} className="rounded bg-surface-2 px-1.5 py-0.5 text-ink-2 font-medium">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              onClick={handleCopyProfile}
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 text-xs font-semibold text-ink-2 hover:border-line-strong hover:text-ink transition-colors"
            >
              <Share2 size={14} />
              <span>{copiedToast ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => setEditModalOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-white shadow-lift hover:bg-accent-hover transition-all duration-200 active:scale-95"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex h-10 items-center gap-2 rounded-xl border border-rose/25 bg-rose/10 px-3.5 text-xs font-semibold text-rose hover:bg-rose/20 transition-colors"
              title="Sign out of your account"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* High-Impact Stat Strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-line pt-6">
          <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-ink-3 font-medium">
              <span>Current Streak</span>
              <Flame size={14} className="text-amber" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-amber font-mono tabular">
              {state.streak.current} <span className="text-xs font-sans text-ink-3">days</span>
            </p>
            <p className="text-[11px] text-ink-3">Best: {state.streak.longest} days</p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-ink-3 font-medium">
              <span>Overall Readiness</span>
              <TrendingUp size={14} className="text-accent" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-ink font-mono tabular">
              {overallCompletion}%
            </p>
            <ProgressBar value={overallCompletion} max={100} size="sm" className="mt-2" />
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-ink-3 font-medium">
              <span>Problems Mastered</span>
              <Target size={14} className="text-mint" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-ink font-mono tabular">
              {totalSolvedCount} <span className="text-xs font-sans text-ink-3">solved</span>
            </p>
            <p className="text-[11px] text-ink-3">Target goal: 250 problems</p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-ink-3 font-medium">
              <span>Deliberate Practice</span>
              <Clock size={14} className="text-sky" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-ink font-mono tabular">
              {summary.hoursStudied} <span className="text-xs font-sans text-ink-3">hrs</span>
            </p>
            <p className="text-[11px] text-ink-3">Last 7 days: {summary.problemsSolved} problems</p>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════
          2. PROGRESS OVERVIEW & DIFFICULTY BREAKDOWN
      ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Problem Difficulty Segmented Breakdown */}
        <div className="lg:col-span-5 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Difficulty Distribution</h2>
                <p className="text-xs text-ink-3">Categorized breakdown of solved problems</p>
              </div>
              <span className="rounded-md border border-line bg-surface-2 px-2 py-1 text-xs font-mono text-ink-2">
                {totalSolvedCount} Total
              </span>
            </div>

            {/* Circular Gauge + Difficulty Bars */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <CircularProgress
                percentage={overallCompletion}
                size={140}
                strokeWidth={11}
                glow={overallCompletion > 0}
              >
                <span className="text-2xl font-extrabold text-ink font-mono">{totalSolvedCount}</span>
                <span className="text-[10.5px] uppercase font-mono text-ink-3">Solved</span>
              </CircularProgress>

              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-mint font-semibold">Easy</span>
                    <span className="font-mono text-ink-2">{easyCount} / 80</span>
                  </div>
                  <ProgressBar value={easyCount} max={80} size="sm" color="var(--color-mint)" className="mt-1" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-amber font-semibold">Medium</span>
                    <span className="font-mono text-ink-2">{mediumCount} / 120</span>
                  </div>
                  <ProgressBar value={mediumCount} max={120} size="sm" color="var(--color-amber)" className="mt-1" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-rose font-semibold">Hard</span>
                    <span className="font-mono text-ink-2">{hardCount} / 50</span>
                  </div>
                  <ProgressBar value={hardCount} max={50} size="sm" color="var(--color-rose)" className="mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights Banner */}
          <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/[0.06] p-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-accent mb-1">
              <Zap size={13} />
              <span>Velocity Diagnosis</span>
            </div>
            <p className="text-ink-2 leading-relaxed">
              Your Medium problem solve rate is in the top 10% this week. Focus on converting 3-4 Hard Graph & DP problems to solidify Tier-1 readiness.
            </p>
          </div>
        </div>

        {/* Right: GitHub-Style Activity Matrix (180 Days) */}
        <div className="lg:col-span-7 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-ink">Consistency Heatmap</h2>
                <p className="text-xs text-ink-3">Continuous practice activity matrix</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 text-xs text-ink-3 font-mono">
                <span>Less</span>
                <span className="h-3 w-3 rounded-sm bg-surface-2 border border-line" />
                <span className="h-3 w-3 rounded-sm bg-[#7c87ff]/40" />
                <span className="h-3 w-3 rounded-sm bg-[#5561f0]" />
                <span className="h-3 w-3 rounded-sm bg-accent" />
                <span>More</span>
              </div>
            </div>

            {/* Grid display */}
            <div className="pt-6 overflow-x-auto">
              <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[540px]">
                {heatmapData.map((item, index) => {
                  let bg = 'bg-surface-2 border border-line/60'
                  if (item.count >= 4) bg = 'bg-accent border border-accent'
                  else if (item.count >= 2) bg = 'bg-[#5561f0] border border-[#5561f0]'
                  else if (item.count === 1) bg = 'bg-[#7c87ff]/45 border border-[#7c87ff]/30'

                  return (
                    <div
                      key={index}
                      title={`${item.count} problem${item.count !== 1 ? 's' : ''} on ${item.dateStr}`}
                      className={cn(
                        'h-3.5 w-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer',
                        bg
                      )}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs font-mono text-ink-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-accent" />
              <span>180-day activity horizon</span>
            </span>
            <span className="text-ink-2 font-semibold">
              {stats.completed} tasks completed today ({formatDisplayDate(today)})
            </span>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════
          3. DSA TOPIC MASTERY PROGRESS
      ════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">DSA Topic Mastery</h2>
            <p className="text-xs text-ink-3">Detailed curriculum completion and target metrics</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1 text-xs">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'mastered', label: 'Mastered (75%+)' },
              { id: 'weak', label: 'Focus Areas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTopicFilter(f.id as any)}
                className={cn(
                  'rounded-lg px-3 py-1 font-medium transition-all',
                  topicFilter === f.id
                    ? 'bg-surface text-ink shadow-sm font-semibold'
                    : 'text-ink-3 hover:text-ink'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Topic Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map(cat => {
            const target = Math.max(1, cat.totalProblemsPlanned)
            const pct = Math.round((cat.problemsSolved / target) * 100)
            const barColor = pct >= 75 ? 'var(--color-mint)' : pct >= 40 ? 'var(--color-accent)' : 'var(--color-amber)'
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedTopicDetail(cat.name)}
                className="group rounded-2xl border border-line bg-surface-2/40 p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-line text-lg shadow-sm">
                      {cat.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-ink-3 font-mono">
                        {cat.problemsSolved} / {cat.totalProblemsPlanned} problems
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={cn('text-sm font-extrabold font-mono tabular', pct >= 75 ? 'text-mint' : pct >= 40 ? 'text-accent' : 'text-amber')}>
                      {pct}%
                    </span>
                    <p className="text-[10.5px] text-ink-3">
                      {pct >= 75 ? 'Mastered' : pct >= 40 ? 'Proficient' : 'Needs Practice'}
                    </p>
                  </div>
                </div>

                <ProgressBar
                  value={pct}
                  max={100}
                  size="sm"
                  color={barColor}
                  className="mt-3"
                />
              </div>
            )
          })}
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════
          4. ACHIEVEMENTS & MILESTONE BADGES
      ════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-card space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber" />
              <h2 className="text-lg font-bold text-ink">Achievements & Badges</h2>
            </div>
            <p className="text-xs text-ink-3">Earn badges by maintaining streaks and conquering algorithms</p>
          </div>

          <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-bold font-mono text-amber">
            {ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map(badge => {
            return (
              <div
                key={badge.id}
                className={cn(
                  'relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300',
                  badge.unlocked
                    ? 'border-line bg-surface-2/60 hover:border-line-strong hover:shadow-lift'
                    : 'border-line/50 bg-surface-2/20 opacity-70'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{badge.icon}</span>
                    {badge.unlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-mint font-mono bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full">
                        <Check size={11} strokeWidth={3} />
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-ink-3 font-mono bg-surface-2 px-2 py-0.5 rounded-full border border-line">
                        <Lock size={10} />
                        Locked
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-ink">{badge.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">{badge.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-line/60 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-ink-3">
                    <span>Progress</span>
                    <span className="text-ink font-semibold">
                      {badge.progress} / {badge.max}
                    </span>
                  </div>
                  <ProgressBar
                    value={badge.progress}
                    max={badge.max}
                    size="sm"
                    color={badge.unlocked ? 'var(--color-mint)' : 'var(--color-accent)'}
                  />
                  {badge.dateUnlocked && (
                    <p className="text-[10px] text-ink-3 text-right">Unlocked {badge.dateUnlocked}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════
          5. EDIT PROFILE MODAL
      ════════════════════════════════════════════════════════ */}
      {editModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditModalOpen(false)}
          onSave={updates => {
            updateUser(updates)
            setEditModalOpen(false)
          }}
        />
      )}

      {/* Topic Detail Quick Dialog */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-pop animate-scale-in">
            <h3 className="text-lg font-bold text-ink">{selectedTopicDetail}</h3>
            <p className="text-xs text-ink-3 mt-1">Ready to level up this pattern?</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setSelectedTopicDetail(null)
                  navigate('/problems')
                }}
                className="flex-1 rounded-xl bg-accent py-2.5 text-xs font-semibold text-white hover:bg-accent-hover"
              >
                Go to Problems →
              </button>
              <button
                onClick={() => setSelectedTopicDetail(null)}
                className="rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-xs font-semibold text-ink-2 hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   EDIT PROFILE MODAL COMPONENT
   ═══════════════════════════════════════════════════════════ */
function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: AuthUser | null
  onClose: () => void
  onSave: (updates: Partial<AuthUser>) => void
}) {
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [targetRole, setTargetRole] = useState(user?.targetRole || '')
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '')
  const [leetcodeUrl, setLeetcodeUrl] = useState(user?.leetcodeUrl || '')
  const [avatarInitial, setAvatarInitial] = useState(user?.avatarInitial || 'V')
  const [avatarGradient, setAvatarGradient] = useState(user?.avatarGradient || 'from-[#5561f0] to-[#a78bfa]')
  const [companiesStr, setCompaniesStr] = useState((user?.targetCompanies || ['Google', 'Meta', 'Stripe']).join(', '))

  const GRADIENTS = [
    { label: 'Indigo Aurora', value: 'from-[#5561f0] to-[#a78bfa]' },
    { label: 'Emerald Cyber', value: 'from-[#10b981] to-[#06b6d4]' },
    { label: 'Violet Flame', value: 'from-[#7c3aed] to-[#f43f5e]' },
    { label: 'Sky Nebula', value: 'from-[#2563eb] to-[#38bdf8]' },
    { label: 'Amber Solar', value: 'from-[#f59e0b] to-[#ea580c]' },
  ]

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetCompanies = companiesStr
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    onSave({
      name: name.trim() || 'User',
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'coder',
      bio: bio.trim(),
      targetRole: targetRole.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      leetcodeUrl: leetcodeUrl.trim(),
      avatarInitial: (avatarInitial.trim()[0] || name[0] || 'V').toUpperCase(),
      avatarGradient,
      targetCompanies: targetCompanies.length ? targetCompanies : ['Google', 'Meta', 'Stripe'],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-pop animate-scale-in text-left my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-extrabold shadow-sm', avatarGradient)}>
            {avatarInitial}
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Edit Developer Identity</h3>
            <p className="text-xs text-ink-3">Customize your coding profile and career targets</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Avatar & Initial Customizer */}
          <div className="rounded-2xl border border-line bg-surface-2/40 p-4 space-y-3">
            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide">
              Avatar Preset & Initial
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={2}
                value={avatarInitial}
                onChange={e => setAvatarInitial(e.target.value.toUpperCase())}
                className="h-10 w-14 rounded-xl border border-line bg-surface text-center font-bold text-lg text-ink uppercase outline-none focus:border-accent"
              />
              <div className="flex flex-wrap gap-2 flex-1">
                {GRADIENTS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setAvatarGradient(g.value)}
                    className={cn(
                      'h-9 w-9 rounded-xl bg-gradient-to-br shadow-sm transition-transform',
                      g.value,
                      avatarGradient === g.value ? 'ring-2 ring-accent scale-110' : 'hover:scale-105'
                    )}
                    title={g.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Username</label>
              <div className="flex items-center rounded-xl border border-line bg-surface px-3 focus-within:border-accent">
                <span className="text-xs text-ink-3 font-mono mr-1">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="h-10 w-full bg-transparent text-sm text-ink outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer II (SDE-2)"
              className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Developer Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Short bio about your preparation, stack and focus areas..."
              className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/..."
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">LeetCode Profile</label>
              <input
                type="url"
                value={leetcodeUrl}
                onChange={e => setLeetcodeUrl(e.target.value)}
                placeholder="https://leetcode.com/..."
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Target Companies (Comma separated)</label>
            <input
              type="text"
              value={companiesStr}
              onChange={e => setCompaniesStr(e.target.value)}
              placeholder="Google, Meta, Stripe, Amazon, Uber"
              className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold text-ink-2 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-accent px-6 py-2.5 text-xs font-semibold text-white shadow-lift hover:bg-accent-hover transition-all duration-200"
            >
              Save Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
