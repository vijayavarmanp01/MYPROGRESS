import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Flame,
  Target,
  Check,
  ChevronRight,
  Brain,
  CheckCircle2,
  XCircle,
  Laptop,
  Play,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { cn } from '../lib/utils'

/* ═══════════════════════════════════════════════════════════
   DATA CONSTANTS & INTERACTIVE MOCKS
   ═══════════════════════════════════════════════════════════ */

interface TopicCardItem {
  id: string
  name: string
  category: 'dsa' | 'sql' | 'leetcode' | 'interview'
  problems: number
  mastered: number
  level: 'Fundamental' | 'Intermediate' | 'Advanced'
  tags: string[]
  icon: string
}

const TOPICS_DATA: TopicCardItem[] = [
  { id: 'arrays', name: 'Arrays & Hashing', category: 'dsa', problems: 32, mastered: 28, level: 'Fundamental', tags: ['Two Pointers', 'Prefix Sum', 'Hash Map'], icon: '🔢' },
  { id: 'two-pointers', name: 'Two Pointers & Sliding Window', category: 'dsa', problems: 24, mastered: 20, level: 'Intermediate', tags: ['Subarrays', 'Pointers', 'Optimization'], icon: '👉' },
  { id: 'trees', name: 'Trees & Binary Search Trees', category: 'dsa', problems: 28, mastered: 22, level: 'Intermediate', tags: ['DFS', 'BFS', 'BST Properties'], icon: '🌳' },
  { id: 'graphs', name: 'Graphs & BFS/DFS', category: 'dsa', problems: 22, mastered: 14, level: 'Advanced', tags: ['Dijkstra', 'Topological Sort', 'Disjoint Set'], icon: '🕸️' },
  { id: 'dp', name: 'Dynamic Programming', category: 'dsa', problems: 30, mastered: 18, level: 'Advanced', tags: ['Knapsack', 'Memoization', 'State Transitions'], icon: '🧠' },
  { id: 'greedy', name: 'Greedy & Heap', category: 'dsa', problems: 18, mastered: 15, level: 'Intermediate', tags: ['Priority Queue', 'Intervals', 'Scheduling'], icon: '🏆' },

  { id: 'sql-joins', name: 'Joins & Subqueries', category: 'sql', problems: 16, mastered: 15, level: 'Fundamental', tags: ['INNER', 'LEFT JOIN', 'Correlated Subquery'], icon: '🔗' },
  { id: 'sql-window', name: 'Window Functions & Aggregations', category: 'sql', problems: 18, mastered: 14, level: 'Intermediate', tags: ['ROW_NUMBER()', 'DENSE_RANK()', 'LEAD/LAG'], icon: '🪟' },
  { id: 'sql-cte', name: 'CTEs & Recursive Queries', category: 'sql', problems: 12, mastered: 10, level: 'Advanced', tags: ['WITH Clause', 'Recursive CTE', 'Hierarchy'], icon: '🧬' },

  { id: 'lc-daily', name: 'Daily LeetCode Challenge', category: 'leetcode', problems: 60, mastered: 52, level: 'Intermediate', tags: ['Daily Streak', 'Contest Ready', 'Time Complexity'], icon: '⚡' },
  { id: 'lc-blind75', name: 'Curated Blind 75 / NeetCode 150', category: 'leetcode', problems: 75, mastered: 58, level: 'Intermediate', tags: ['Essential Patterns', 'High Frequency', 'FAANG'], icon: '🎯' },

  { id: 'cs-core', name: 'Core CS (OS, DBMS, Networks)', category: 'interview', problems: 45, mastered: 38, level: 'Fundamental', tags: ['Virtual Memory', 'ACID', 'TCP/IP Handshake'], icon: '💻' },
  { id: 'sys-design', name: 'System Design Fundamentals', category: 'interview', problems: 15, mastered: 11, level: 'Advanced', tags: ['Scalability', 'Caching', 'Message Queues'], icon: '🏗️' },
  { id: 'hr-behavioral', name: 'HR & STAR Behavioral Stories', category: 'interview', problems: 20, mastered: 19, level: 'Fundamental', tags: ['STAR Method', 'Leadership', 'Conflict Resolution'], icon: '🎙️' },
]

const COMPARISON_ROWS = [
  {
    before: 'Random problem solving with no direction',
    after: 'Curated daily task system with focused problem queues',
  },
  {
    before: 'Forgetting solutions after 2 weeks',
    after: 'Spaced repetition revision system (1d, 3d, 7d, 30d)',
  },
  {
    before: 'No visibility into weak DSA patterns',
    after: 'Topic-level mastery analytics & weak area diagnostics',
  },
  {
    before: 'Sporadic study habits with broken streaks',
    after: 'Streak tracking with motivation mechanics & freeze guards',
  },
  {
    before: 'Interview anxiety and imposter syndrome',
    after: 'Measurable placement readiness across DSA, SQL & Core CS',
  },
]

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function LandingPage({ onOpenAuth }: { onOpenAuth?: (mode: 'login' | 'signup') => void }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Interactive state in the hero preview
  const [activeTab, setActiveTab] = useState<'today' | 'topics' | 'revision' | 'readiness'>('today')
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    't1': true,
    't2': true,
    't3': true,
    't4': true,
    't5': false,
    't6': false,
  })
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'dsa' | 'sql' | 'leetcode' | 'interview'>('all')
  const [hoveredCell, setHoveredCell] = useState<{ day: number; count: number; dateStr: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Sticky nav scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStartPreparing = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else if (onOpenAuth) {
      onOpenAuth('signup')
    } else {
      navigate('/signup')
    }
  }

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else if (onOpenAuth) {
      onOpenAuth('login')
    } else {
      navigate('/login')
    }
  }

  const filteredTopics = useMemo(() => {
    if (activeCategoryFilter === 'all') return TOPICS_DATA
    return TOPICS_DATA.filter(t => t.category === activeCategoryFilter)
  }, [activeCategoryFilter])

  // Generate heatmap grid for 52 weeks (364 days)
  const heatmapData = useMemo(() => {
    const data = []
    const today = new Date()
    for (let i = 180; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      // Realistic probability pattern with recent high streak
      let count = 0
      const rand = Math.random()
      if (i < 30) {
        count = rand > 0.15 ? Math.floor(Math.random() * 5) + 2 : 0
      } else if (i < 90) {
        count = rand > 0.28 ? Math.floor(Math.random() * 4) + 1 : 0
      } else {
        count = rand > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0
      }
      data.push({
        day: i,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
      })
    }
    return data
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-[#07080e] text-[#eef0f7] selection:bg-[#7c87ff]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* ── Background Subtle Ambient Glows ───────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-[20%] left-1/2 h-[750px] w-[1000px] -translate-x-1/2 rounded-full opacity-[0.14]"
          style={{
            background: 'radial-gradient(ellipse at center, #7c87ff 0%, #5561f0 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, #a78bfa 0%, transparent 65%)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute top-[75%] left-[-10%] h-[700px] w-[700px] rounded-full opacity-[0.09]"
          style={{
            background: 'radial-gradient(circle, #60a5fa 0%, transparent 65%)',
            filter: 'blur(120px)',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          1. STICKY MINIMAL NAVIGATION BAR
      ════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-white/[0.08] bg-[#07080e]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] py-3'
            : 'border-b border-transparent bg-transparent py-5'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-mono text-[13px] font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #5561f0 0%, #7c87ff 50%, #a78bfa 100%)',
                boxShadow: '0 4px 16px -2px rgba(124,135,255,0.4)',
              }}
            >
              MP
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white transition-colors group-hover:text-white/90">
                MyProgress
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-white/40 font-mono">
                DSA Command Center
              </span>
            </div>
          </Link>

          {/* Nav Anchor Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-md">
            {[
              { label: 'Product Preview', href: '#preview' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Curriculum', href: '#curriculum' },
              { label: 'Consistency', href: '#consistency' },
              { label: 'Transformation', href: '#readiness' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 text-[13px] font-medium text-white/60 transition-colors hover:text-white hover:bg-white/[0.06]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex h-9 items-center gap-2 rounded-xl bg-white/[0.08] px-4 text-[13px] font-medium text-white transition-all hover:bg-white/[0.14] border border-white/[0.1]"
              >
                <Laptop size={14} />
                <span>Go to Dashboard</span>
                <ArrowRight size={13} className="text-white/60" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-[13.5px] font-medium text-white/70 transition-colors hover:text-white px-2.5 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={handleStartPreparing}
                  className="group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-xl px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,135,255,0.4)] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #5561f0 0%, #7c87ff 100%)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <span>Start Preparing</span>
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          2. HERO SECTION — “Turn DSA Practice Into Progress.”
      ════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7c87ff]/30 bg-[#7c87ff]/10 px-3.5 py-1.5 text-[12px] font-semibold text-[#a78bfa] shadow-[0_0_20px_rgba(124,135,255,0.15)] animate-fade-up">
            <Sparkles size={13} className="text-[#7c87ff] animate-pulse" />
            <span>2026 Developer Edition · DSA & Placement Command Center</span>
            <span className="rounded-full bg-[#7c87ff]/20 px-1.5 py-0.2 text-[10px] uppercase font-mono text-white/90">
              v2.4
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.06] max-w-4xl mx-auto animate-fade-up">
            Turn DSA Practice{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #7c87ff 50%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Into Progress.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mx-auto mt-6 max-w-2xl text-[16px] sm:text-[18px] leading-relaxed text-white/55 font-normal animate-fade-up">
            A focused workspace to <span className="text-white/90 font-medium">practice</span>,{' '}
            <span className="text-white/90 font-medium">track</span>,{' '}
            <span className="text-white/90 font-medium">revise</span>, and become interview-ready — one problem at a time.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
            <button
              onClick={handleStartPreparing}
              className="group relative flex h-12 items-center gap-2.5 overflow-hidden rounded-xl px-7 text-[15px] font-semibold text-white transition-all duration-300 hover:shadow-[0_0_32px_rgba(124,135,255,0.55)] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #5561f0 0%, #7c87ff 100%)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
            >
              <span>Start Preparing Free</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <a
              href="#preview"
              className="flex h-12 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 text-[14.5px] font-medium text-white/80 transition-all hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
            >
              <Play size={14} className="text-[#7c87ff]" />
              <span>Explore Interactive UI</span>
            </a>
          </div>

          {/* Key Metric Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-white/[0.06] pt-8 text-[13px] text-white/45 font-mono">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>Local-First & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>Spaced Repetition Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>15+ Core DSA & SQL Curriculums</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              REALISTIC INTERACTIVE PRODUCT DASHBOARD PREVIEW
          ════════════════════════════════════════════════════ */}
          <div id="preview" className="relative mt-16 scroll-mt-24">
            
            {/* Ambient Back Glow */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30 blur-2xl transition duration-1000"
              style={{
                background: 'radial-gradient(circle, rgba(124,135,255,0.4) 0%, rgba(96,165,250,0.15) 50%, transparent 80%)',
              }}
            />

            {/* Dashboard Container Mockup */}
            <div
              className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0e17]/95 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.9)] text-left backdrop-blur-xl"
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090b12] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]/80" />
                  <span className="ml-3 font-mono text-[11px] text-white/30">
                    myprogress.dev/workspace/developer
                  </span>
                </div>

                {/* Dashboard Nav Tabs */}
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5 text-[12px]">
                  {[
                    { id: 'today', label: '⚡ Today (8/14)' },
                    { id: 'topics', label: '📊 DSA Topics' },
                    { id: 'revision', label: '🧠 Spaced Queue' },
                    { id: 'readiness', label: '🎯 Interview Ready' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'rounded-md px-3 py-1 font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-[#7c87ff]/20 text-[#a78bfa] shadow-sm border border-[#7c87ff]/30'
                          : 'text-white/40 hover:text-white/80'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                    <Flame size={12} />
                    7 Day Streak
                  </span>
                </div>
              </div>

              {/* Main Dashboard Hero Grid */}
              <div className="p-5 sm:p-7 space-y-6">
                
                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.14]">
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-white/45">
                      <span>Today's Tasks</span>
                      <span className="text-emerald-400 font-mono">57%</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">8 / 14</span>
                      <span className="text-xs text-white/40">completed</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '57%' }} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.14]">
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-white/45">
                      <span>Current Streak</span>
                      <Flame size={14} className="text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">7 Days</span>
                      <span className="text-xs text-white/40">🔥 Active</span>
                    </div>
                    <p className="mt-3 text-[11px] text-white/35">Best streak: 21 days</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.14]">
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-white/45">
                      <span>Problems Solved</span>
                      <Target size={14} className="text-[#7c87ff]" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#7c87ff] font-mono">124</span>
                      <span className="text-xs text-white/40">problems</span>
                    </div>
                    <div className="mt-3 flex gap-2 text-[10.5px] font-mono text-white/40">
                      <span className="text-emerald-400">54 Easy</span>
                      <span className="text-amber-400">58 Med</span>
                      <span className="text-rose-400">12 Hard</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.14]">
                    <div className="flex items-center justify-between text-[11.5px] font-medium text-white/45">
                      <span>Overall Progress</span>
                      <TrendingUp size={14} className="text-[#a78bfa]" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">68%</span>
                      <span className="text-xs text-[#a78bfa]">Interview Ready</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#5561f0] to-[#a78bfa] rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>

                {/* Tabbed Interactive Body */}
                {activeTab === 'today' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
                    {/* Left: Interactive Checklist */}
                    <div className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">Daily Preparation Checklist</h3>
                          <p className="text-[12px] text-white/40">Click checkboxes to test live tracking interaction</p>
                        </div>
                        <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] font-mono text-white/60">
                          {Object.values(checkedTasks).filter(Boolean).length} / 6 Complete
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { id: 't1', title: 'Solve 2 Two-Pointer Problems (LeetCode Medium)', time: '45 mins', tag: 'DSA', category: 'Arrays' },
                          { id: 't2', title: 'Revise Binary Tree Level Order Traversal', time: '20 mins', tag: 'Revision', category: 'Trees' },
                          { id: 't3', title: 'Practice 2 SQL Window Function Queries (DENSE_RANK)', time: '30 mins', tag: 'SQL', category: 'Databases' },
                          { id: 't4', title: 'Solve Today’s LeetCode Daily Challenge', time: '25 mins', tag: 'LeetCode', category: 'Daily' },
                          { id: 't5', title: 'Study Operating System Process Scheduling & Deadlocks', time: '35 mins', tag: 'Core CS', category: 'OS' },
                          { id: 't6', title: 'Mock 1 STAR Format HR Behavioral Answer', time: '15 mins', tag: 'Interview', category: 'HR' },
                        ].map(task => {
                          const done = checkedTasks[task.id]
                          return (
                            <div
                              key={task.id}
                              onClick={() => setCheckedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                              className={cn(
                                'group flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200',
                                done
                                  ? 'border-emerald-500/20 bg-emerald-500/[0.04] text-white/50'
                                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] text-white'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                    done
                                      ? 'border-emerald-400 bg-emerald-400 text-black'
                                      : 'border-white/30 group-hover:border-white/60'
                                  )}
                                >
                                  {done && <Check size={12} strokeWidth={3} />}
                                </div>
                                <div className="truncate">
                                  <p className={cn('text-[13px] font-medium truncate', done && 'line-through text-white/40')}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/40">
                                    <span>{task.category}</span>
                                    <span>·</span>
                                    <span className="font-mono">{task.time}</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  'shrink-0 rounded px-2 py-0.5 text-[10.5px] font-semibold font-mono',
                                  task.tag === 'DSA' && 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
                                  task.tag === 'Revision' && 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
                                  task.tag === 'SQL' && 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
                                  task.tag === 'LeetCode' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                                  task.tag === 'Core CS' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                                  task.tag === 'Interview' && 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                )}
                              >
                                {task.tag}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Right: Topic Progress Breakdown */}
                    <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-white">Focus Topic Mastery</h3>
                          <span className="text-[12px] text-[#7c87ff] font-medium cursor-pointer hover:underline">
                            View All 15 →
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {[
                            { name: 'Arrays & Hashing', solved: 28, total: 32, pct: 88, icon: '🔢', color: '#7c87ff' },
                            { name: 'Trees & BST', solved: 22, total: 28, pct: 78, icon: '🌳', color: '#34d399' },
                            { name: 'Dynamic Programming', solved: 18, total: 30, pct: 60, icon: '🧠', color: '#a78bfa' },
                            { name: 'SQL Window Functions', solved: 14, total: 18, pct: 77, icon: '🪟', color: '#38bdf8' },
                            { name: 'Graphs & BFS/DFS', solved: 14, total: 22, pct: 63, icon: '🕸️', color: '#f43f5e' },
                          ].map(topic => (
                            <div key={topic.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-[12.5px]">
                                <span className="flex items-center gap-2 font-medium text-white/90">
                                  <span>{topic.icon}</span>
                                  {topic.name}
                                </span>
                                <span className="font-mono text-xs text-white/40">
                                  {topic.solved}/{topic.total} ({topic.pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${topic.pct}%`, backgroundColor: topic.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Readiness Insight Card */}
                      <div className="mt-5 rounded-lg border border-[#7c87ff]/20 bg-[#7c87ff]/[0.06] p-3 text-[12px] text-white/80">
                        <div className="flex items-center gap-2 font-semibold text-[#a78bfa] mb-1">
                          <Brain size={14} />
                          <span>Smart Recommendation</span>
                        </div>
                        <p className="text-white/60 leading-relaxed text-[11.5px]">
                          You solved 4 Graph problems this week. Practice 2 Dynamic Programming questions today to keep your streak balanced!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Topics Tab Mock */}
                {activeTab === 'topics' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
                    {TOPICS_DATA.slice(0, 6).map(t => (
                      <div key={t.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{t.icon}</span>
                          <span className="text-[10.5px] font-mono rounded bg-white/[0.05] px-2 py-0.5 text-white/60">
                            {t.level}
                          </span>
                        </div>
                        <h4 className="text-[13.5px] font-bold text-white">{t.name}</h4>
                        <div className="flex justify-between text-xs text-white/40 font-mono">
                          <span>{t.mastered} / {t.problems} solved</span>
                          <span>{Math.round((t.mastered / t.problems) * 100)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full bg-[#7c87ff] rounded-full" style={{ width: `${(t.mastered / t.problems) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Revision Tab Mock */}
                {activeTab === 'revision' && (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-white">Spaced Repetition Schedule</h4>
                        <p className="text-[12px] text-white/40">Problems automatically scheduled for revision at 1d, 3d, 7d, and 30d intervals</p>
                      </div>
                      <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-mono text-purple-300">
                        4 Due Today
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { title: 'LRU Cache (LeetCode 146)', interval: 'Day 7 Revision', diff: 'Medium', topic: 'Hash + DLL' },
                        { title: 'Merge K Sorted Lists (LeetCode 23)', interval: 'Day 3 Revision', diff: 'Hard', topic: 'Heap' },
                        { title: 'Coin Change (LeetCode 322)', interval: 'Day 30 Mastery', diff: 'Medium', topic: 'DP' },
                        { title: 'Rank Scores via DENSE_RANK()', interval: 'Day 1 Revision', diff: 'Medium', topic: 'SQL' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                          <div>
                            <p className="text-[13px] font-semibold text-white">{item.title}</p>
                            <span className="text-[11px] text-purple-300 font-mono">{item.interval} · {item.topic}</span>
                          </div>
                          <span className={cn('text-[11px] font-mono px-2 py-0.5 rounded', item.diff === 'Hard' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300')}>
                            {item.diff}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Readiness Tab Mock */}
                {activeTab === 'readiness' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                      <p className="text-xs text-white/40 uppercase font-mono">DSA Readiness</p>
                      <p className="mt-2 text-3xl font-extrabold text-[#7c87ff] font-mono">82%</p>
                      <p className="mt-1 text-xs text-emerald-400">FAANG Ready (Tier 1)</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                      <p className="text-xs text-white/40 uppercase font-mono">SQL & Core CS</p>
                      <p className="mt-2 text-3xl font-extrabold text-[#38bdf8] font-mono">75%</p>
                      <p className="mt-1 text-xs text-emerald-400">High Confidence</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                      <p className="text-xs text-white/40 uppercase font-mono">STAR HR & Behavioral</p>
                      <p className="mt-2 text-3xl font-extrabold text-[#34d399] font-mono">90%</p>
                      <p className="mt-1 text-xs text-emerald-400">Stories Prepared</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. HOW IT WORKS — 3-Step Minimal Workflow
      ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 border-t border-white/[0.07] bg-[#07080e]/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7c87ff]">
              Zero Friction Architecture
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How Top Engineers Prepare
            </h2>
            <p className="mt-3 text-sm text-white/50">
              Eliminate decision fatigue and master algorithms with deliberate, structured daily execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 01 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-300 hover:border-[#7c87ff]/40 hover:bg-white/[0.04] group">
              <div className="font-mono text-3xl font-extrabold text-[#7c87ff]/40 group-hover:text-[#7c87ff] transition-colors">
                01
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Plan</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/50">
                Know exactly what to practice today. Structured roadmap categories and daily problem queues eliminate wondering what to code next.
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs text-[#7c87ff]">
                <span>Daily Task Generator</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Step 02 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-300 hover:border-[#a78bfa]/40 hover:bg-white/[0.04] group">
              <div className="font-mono text-3xl font-extrabold text-[#a78bfa]/40 group-hover:text-[#a78bfa] transition-colors">
                02
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Practice</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/50">
                Solve problems and build consistency. Log time, pattern tags, key insights, and difficulty breakdown without breaking your flow.
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs text-[#a78bfa]">
                <span>Time & Pattern Tracker</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Step 03 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.04] group">
              <div className="font-mono text-3xl font-extrabold text-emerald-400/40 group-hover:text-emerald-400 transition-colors">
                03
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Progress</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/50">
                Retain solutions with automated spaced repetition, track topic-wise mastery, and measure your placement interview readiness.
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs text-emerald-400">
                <span>Spaced Repetition & Analytics</span>
                <ChevronRight size={14} />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. WHAT YOU CAN TRACK — Interactive Curriculum Matrix
      ════════════════════════════════════════════════════════ */}
      <section id="curriculum" className="relative py-20 border-t border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7c87ff]">
                Comprehensive Coverage
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                What You Can Track
              </h2>
              <p className="mt-2 text-sm text-white/50 max-w-lg">
                Structured tracking across all technical interview verticals — from Data Structures to SQL and System Design.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 text-xs">
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'dsa', label: 'DSA Topics' },
                { id: 'sql', label: 'SQL & DB' },
                { id: 'leetcode', label: 'LeetCode' },
                { id: 'interview', label: 'Interview Prep' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id as any)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 font-medium transition-all',
                    activeCategoryFilter === tab.id
                      ? 'bg-[#7c87ff] text-white shadow-sm font-semibold'
                      : 'text-white/45 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Interactive Topic Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map(topic => {
              const pct = Math.round((topic.mastered / topic.problems) * 100)
              return (
                <div
                  key={topic.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.04] group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{topic.icon}</span>
                    <span className="font-mono text-[11px] rounded bg-white/[0.06] px-2 py-0.5 text-white/60">
                      {topic.level}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-white group-hover:text-[#7c87ff] transition-colors">
                    {topic.name}
                  </h3>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {topic.tags.map((tag, i) => (
                      <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-white/40">
                      <span>{topic.mastered} / {topic.problems} Mastered</span>
                      <span className="text-white/70 font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#5561f0] to-[#7c87ff]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. CONSISTENCY SECTION — “Consistency Beats Intensity.”
      ════════════════════════════════════════════════════════ */}
      <section id="consistency" className="relative py-20 border-t border-white/[0.07] bg-[#090b14]/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <Flame size={13} />
              <span>Momentum Engine</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              “Consistency beats intensity.”
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/50">
              Solving 2 problems every single day for 60 days will outperform a 14-hour weekend cram session every time.
            </p>
          </div>

          {/* GitHub-style Activity Heatmap Card */}
          <div className="rounded-2xl border border-white/[0.09] bg-[#0d0f1a] p-6 sm:p-8 shadow-2xl">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
              <div>
                <h3 className="text-base font-bold text-white">Daily Contribution Matrix</h3>
                <p className="text-xs text-white/40">180 days of continuous practice data</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                <span>Less</span>
                <span className="h-3 w-3 rounded-sm bg-white/[0.05]" />
                <span className="h-3 w-3 rounded-sm bg-[#293070]" />
                <span className="h-3 w-3 rounded-sm bg-[#4f59e0]" />
                <span className="h-3 w-3 rounded-sm bg-[#7c87ff]" />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="pt-6 overflow-x-auto">
              <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[700px]">
                {heatmapData.map((item, index) => {
                  let bg = 'bg-white/[0.04]'
                  if (item.count >= 4) bg = 'bg-[#7c87ff]'
                  else if (item.count >= 2) bg = 'bg-[#4f59e0]'
                  else if (item.count === 1) bg = 'bg-[#293070]'

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredCell(item)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={cn(
                        'h-3.5 w-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer',
                        bg
                      )}
                    />
                  )
                })}
              </div>

              {/* Tooltip Display */}
              <div className="mt-3 min-h-[24px] text-xs font-mono text-white/60">
                {hoveredCell ? (
                  <span>
                    <span className="text-white font-bold">{hoveredCell.count} problem{hoveredCell.count !== 1 ? 's' : ''} solved</span> on {hoveredCell.dateStr}
                  </span>
                ) : (
                  <span className="text-white/30">Hover over any square to view daily problem volume</span>
                )}
              </div>
            </div>

            {/* Streak & Consistency Stats Row */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/[0.07] pt-6">
              <div>
                <span className="text-xs text-white/40 font-mono">🔥 Current Streak</span>
                <p className="mt-1 text-2xl font-extrabold text-amber-400 font-mono">24 Days</p>
                <span className="text-[11px] text-white/30">Active streak</span>
              </div>
              <div>
                <span className="text-xs text-white/40 font-mono">🏆 Best Streak</span>
                <p className="mt-2 text-2xl font-extrabold text-white font-mono">48 Days</p>
                <span className="text-[11px] text-white/30">Personal record</span>
              </div>
              <div>
                <span className="text-xs text-white/40 font-mono">💻 Problems Solved</span>
                <p className="mt-2 text-2xl font-extrabold text-[#7c87ff] font-mono">124 Problems</p>
                <span className="text-[11px] text-white/30">Across 12 topics</span>
              </div>
              <div>
                <span className="text-xs text-white/40 font-mono">⏱️ Study Hours</span>
                <p className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">86.5 Hours</p>
                <span className="text-[11px] text-white/30">Deliberate practice</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. PLACEMENT READINESS — Transformation Section
      ════════════════════════════════════════════════════════ */}
      <section id="readiness" className="relative py-20 border-t border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">
              The Transformation
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              From Chaos to Interview-Ready Confidence
            </h2>
            <p className="mt-3 text-sm text-white/50">
              See why hundreds of candidates switched from random grinding to systematic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* The Old Way */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-7 space-y-5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
                <XCircle size={20} />
                <span>The Random Grind (Old Way)</span>
              </div>
              
              <ul className="space-y-4">
                {COMPARISON_ROWS.map((row, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-white/60">
                    <span className="mt-0.5 text-rose-400 font-bold shrink-0">✕</span>
                    <span>{row.before}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With MyProgress */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-7 space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.06)]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <CheckCircle2 size={20} />
                <span>With MyProgress Command Center</span>
              </div>

              <ul className="space-y-4">
                {COMPARISON_ROWS.map((row, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-white/90 font-medium">
                    <span className="mt-0.5 text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{row.after}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. FINAL CTA SECTION — “Your interview preparation starts today.”
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 border-t border-white/[0.08] overflow-hidden">
        
        {/* Glow ambient */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #5561f0 0%, #a78bfa 50%, transparent 80%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            “Your interview preparation starts today.”
          </h2>
          
          <p className="mt-6 text-base sm:text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
            Stop wondering what to practice next. Start making measurable progress and unlock your true engineering potential.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleStartPreparing}
              className="group relative flex h-13 items-center gap-2.5 overflow-hidden rounded-xl px-8 text-[15.5px] font-semibold text-white transition-all duration-300 hover:shadow-[0_0_36px_rgba(124,135,255,0.6)] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #5561f0 0%, #7c87ff 100%)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <span>Start Preparing Free →</span>
            </button>

            <button
              onClick={handleSignIn}
              className="flex h-13 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-6 text-[14.5px] font-medium text-white/80 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              Already have an account? Sign In
            </button>
          </div>

          <p className="mt-8 text-xs text-white/30 font-mono">
            Free forever for personal preparation · No credit card required · Local-first data storage
          </p>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          8. FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-[#05060b] py-12 text-[13px] text-white/40 font-mono">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-[#5561f0] text-white flex items-center justify-center font-bold text-[10px]">
              MP
            </div>
            <span className="font-semibold text-white/80 font-sans">MyProgress</span>
            <span className="text-white/20">|</span>
            <span>© 2026 DSA Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
            <button onClick={handleStartPreparing} className="hover:text-white transition-colors">Get Started</button>
          </div>
        </div>
      </footer>

    </div>
  )
}
