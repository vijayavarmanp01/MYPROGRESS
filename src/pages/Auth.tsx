import { useState, useRef, useEffect, useId, type FormEvent } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Eye, EyeOff, ArrowRight, Check, AlertCircle,
  Loader2, Sparkles, Terminal,
} from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { cn } from '../lib/utils'

/* ─── Types ──────────────────────────────────────────────── */
type Mode = 'login' | 'signup' | 'forgot'

interface FieldError { email?: string; password?: string; name?: string; general?: string }

/* ─── Validate ───────────────────────────────────────────── */
function validate(mode: Mode, fields: { name?: string; email: string; password: string }): FieldError {
  const errors: FieldError = {}
  if (mode === 'signup' && !fields.name?.trim()) {
    errors.name = 'Name is required'
  }
  if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Enter a valid email address'
  }
  if (mode !== 'forgot' && fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

/* ─── Animated background mesh ──────────────────────────── */
function MeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-[#060810]" />

      {/* Radial orbs */}
      <div
        className="absolute -top-1/4 left-1/4 h-[700px] w-[700px] rounded-full opacity-[0.18]"
        style={{
          background: 'radial-gradient(circle, #7c87ff 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'float-slow 14s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[600px] w-[600px] rounded-full opacity-[0.14]"
        style={{
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'float-slow 18s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Fine dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #060810 100%)',
        }}
      />
    </div>
  )
}

/* ─── Text Input ─────────────────────────────────────────── */
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  rightSlot?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

function TextInput({ label, error, icon, rightSlot, id: _id, className, ref, ...props }: TextInputProps) {
  const autoId = useId()
  const id = _id ?? autoId
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[12px] font-semibold tracking-[0.05em] text-white/50 uppercase"
      >
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-center overflow-hidden rounded-xl transition-all duration-200',
          'bg-white/[0.04] border',
          focused
            ? 'border-white/25 ring-2 ring-white/[0.08] shadow-[0_0_0_3px_rgba(124,135,255,0.12)]'
            : error
            ? 'border-red-500/40 ring-2 ring-red-500/[0.07]'
            : 'border-white/[0.08] hover:border-white/[0.14]'
        )}
      >
        {icon && (
          <div className="pointer-events-none flex h-11 w-10 shrink-0 items-center justify-center text-white/25">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'h-11 flex-1 bg-transparent text-[13.5px] text-white placeholder:text-white/20',
            'outline-none ring-0 tracking-[-0.01em]',
            icon ? 'pl-0 pr-4' : 'px-4',
            rightSlot && 'pr-0',
            className
          )}
          {...props}
        />
        {rightSlot && (
          <div className="flex h-11 shrink-0 items-center pr-3">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] text-red-400/90 animate-fade-up">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}

/* ─── Success overlay ────────────────────────────────────── */
function SuccessFlash({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-scale-in">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#34d399]/15 ring-[6px] ring-[#34d399]/10">
        <Check size={28} className="text-[#34d399]" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[20px] font-bold tracking-[-0.02em] text-white">
          Welcome, {name.split(' ')[0]}
        </p>
        <p className="mt-1 text-[13px] text-white/40">Signing you in…</p>
      </div>
    </div>
  )
}

/* ─── Feature list (left panel) ─────────────────────────── */
const FEATURES = [
  { icon: '⚡', text: 'Daily task streaks with smart spaced repetition' },
  { icon: '📊', text: 'Analytics dashboard across 15+ DSA topics' },
  { icon: '🎯', text: 'Interview readiness tracker for DSA, CS & HR' },
]

const STATS = [
  { value: '500+', label: 'Problems trackable' },
  { value: '15', label: 'DSA topics' },
  { value: '∞', label: 'Day streaks possible' },
]

/* ═══════════════════════════════════════════════════════════
   Main Auth Page
═══════════════════════════════════════════════════════════ */
export function AuthPage() {
  const { signIn, signUp, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const rawRedirect = searchParams.get('redirect')
  const redirectTarget = rawRedirect && rawRedirect.startsWith('/') ? rawRedirect : '/dashboard'

  const getInitialMode = (): Mode => {
    const q = searchParams.get('mode')
    if (q === 'signup' || location.pathname === '/signup') return 'signup'
    if (q === 'forgot' || location.pathname === '/forgot') return 'forgot'
    return 'login'
  }

  const [mode, setMode] = useState<Mode>(getInitialMode)
  const [success, setSuccess] = useState(false)
  const [successName, setSuccessName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})

  const [fields, setFields] = useState({ name: '', email: '', password: '' })

  const emailRef = useRef<HTMLInputElement>(null)

  // Synchronize mode when location changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup')
    } else if (location.pathname === '/forgot') {
      setMode('forgot')
    } else if (location.pathname === '/login' || location.pathname === '/auth') {
      setMode('login')
    }
  }, [location.pathname])

  // Redirect to workspace if already authenticated or after showing success animation
  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, success, navigate, redirectTarget])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(redirectTarget, { replace: true })
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [success, navigate, redirectTarget])

  // Auto-focus email on mode change
  useEffect(() => {
    setErrors({})
    setFields(f => ({ ...f, password: '' }))
    setTimeout(() => emailRef.current?.focus(), 120)
  }, [mode])

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setForgotSent(false)
    setErrors({})
    const searchStr = location.search
    if (newMode === 'signup') {
      navigate(`/signup${searchStr}`, { replace: true })
    } else if (newMode === 'login') {
      navigate(`/login${searchStr}`, { replace: true })
    } else if (newMode === 'forgot') {
      navigate(`/forgot${searchStr}`, { replace: true })
    }
  }

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(f => ({ ...f, [key]: e.target.value }))
    // Clear that field's error live
    if (errors[key as keyof FieldError]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (mode === 'forgot') {
      if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrors({ email: 'Enter a valid email address' })
        return
      }
      setForgotSent(true)
      return
    }

    const errs = validate(mode, fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      setErrors({})
      if (mode === 'login') {
        await signIn(fields.email, fields.password)
      } else {
        await signUp(fields.name, fields.email, fields.password)
      }
      setSuccessName(mode === 'signup' ? fields.name : fields.email.split('@')[0])
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
        setErrors({
          general: 'Backend server is unreachable. Please ensure the backend is running.',
        })
      } else {
        setErrors({ general: msg })
      }
    }
  }

  const anyLoading = loading

  /* ── Inline style animations ──────────────────────────── */
  return (
    <>
      {/* Inject animations that aren't in Tailwind */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.04); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes marquee-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: marquee-x 28s linear infinite;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink { animation: cursor-blink 1.1s step-end infinite; }
      `}</style>

      <div className="relative flex min-h-screen w-full overflow-hidden bg-[#060810]">

        {/* ── Background mesh ─────────────────────────────── */}
        <MeshBackground />

        {/* ══════════════════════════════════════════════════
            LEFT PANEL — Brand / Marketing
        ══════════════════════════════════════════════════ */}
        <div className="relative hidden min-h-screen flex-col justify-between p-10 lg:flex lg:w-[48%] xl:w-[52%]">

          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link to="/landing" className="flex items-center gap-3 group">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-extrabold text-white transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #5561f0, #a78bfa)' }}
              >
                MP
              </div>
              <span className="text-[15px] font-bold tracking-[-0.02em] text-white">MyProgress</span>
              <span className="ml-1 rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-semibold text-white/40">
                2026
              </span>
            </Link>
            <Link
              to="/landing"
              className="text-[12.5px] text-white/40 hover:text-white transition-colors"
            >
              ← Back to Overview
            </Link>
          </div>

          {/* Hero copy */}
          <div className="max-w-md space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7c87ff]/25 bg-[#7c87ff]/10 px-3 py-1">
                <Sparkles size={12} className="text-[#7c87ff]" />
                <span className="text-[11.5px] font-semibold text-[#7c87ff]">
                  DSA Command Center · 2026
                </span>
              </div>

              <h1
                className="text-[42px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white xl:text-[52px]"
                style={{ textShadow: '0 0 80px rgba(124,135,255,0.2)' }}
              >
                Build consistency.
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #7c87ff 0%, #a78bfa 50%, #60a5fa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Master DSA.
                </span>
                <br />
                Get interview ready.
              </h1>

              <p className="text-[15px] leading-relaxed text-white/45">
                The developer-focused study tracker that turns daily practice into long-term mastery.
              </p>
            </div>

            {/* Feature bullets */}
            <ul className="space-y-3">
              {FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 text-[16px]">{f.icon}</span>
                  <span className="text-[13.5px] leading-snug text-white/50">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="flex gap-6 border-t border-white/[0.07] pt-6">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="text-[22px] font-extrabold tracking-[-0.03em] text-white">
                    {s.value}
                  </p>
                  <p className="text-[11.5px] text-white/35">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal-style ticker */}
          <div className="space-y-2 overflow-hidden">
            <p className="flex items-center gap-1.5 text-[11px] text-white/20">
              <Terminal size={10} />
              live activity
            </p>
            <div className="overflow-hidden">
              <div className="marquee-track">
                {[
                  '🔢 Arrays & Hashing',
                  '🌳 Trees',
                  '📚 Stack',
                  '🔍 Binary Search',
                  '🧠 Dynamic Programming',
                  '🕸️ Graphs',
                  '🏆 Heap',
                  '🔄 Backtracking',
                  '💻 SQL',
                  '🎯 Interview Skills',
                  // repeat for seamless loop
                  '🔢 Arrays & Hashing',
                  '🌳 Trees',
                  '📚 Stack',
                  '🔍 Binary Search',
                  '🧠 Dynamic Programming',
                  '🕸️ Graphs',
                  '🏆 Heap',
                  '🔄 Backtracking',
                  '💻 SQL',
                  '🎯 Interview Skills',
                ].map((t, i) => (
                  <span
                    key={i}
                    className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11.5px] text-white/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT PANEL — Auth form
        ══════════════════════════════════════════════════ */}
        <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-6 lg:p-10">

          {/* Glass panel */}
          <div
            className="w-full max-w-[400px] rounded-2xl p-8 lg:p-9"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px -20px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Mobile logo (only shows on mobile) ──── */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/landing" className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, #5561f0, #a78bfa)' }}
                >
                  MP
                </div>
                <span className="text-[14px] font-bold tracking-[-0.02em] text-white">MyProgress</span>
              </Link>
              <Link to="/landing" className="text-[12px] text-white/40 hover:text-white">
                ← Overview
              </Link>
            </div>

            {/* ── Success state ───────────────────────── */}
            {success ? (
              <SuccessFlash name={successName} />
            ) : (

              /* ── Form states ───────────────────────── */
              <div key={mode} className="animate-fade-up space-y-6">

                {/* Header */}
                <div>
                  {mode === 'forgot' ? (
                    <>
                      <h2 className="text-[22px] font-bold tracking-[-0.025em] text-white">
                        Reset password
                      </h2>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/40">
                        We'll send a recovery link to your email.
                      </p>
                    </>
                  ) : mode === 'login' ? (
                    <>
                      <h2 className="text-[22px] font-bold tracking-[-0.025em] text-white">
                        Welcome back
                      </h2>
                      <p className="mt-1.5 text-[13px] text-white/40">
                        Sign in to continue your streak and track your progress.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-[22px] font-bold tracking-[-0.025em] text-white">
                        Create account
                      </h2>
                      <p className="mt-1.5 text-[13px] text-white/40">
                        Start building your DSA command center today.
                      </p>
                    </>
                  )}
                </div>

                {/* Segmented Mode Selector Tab */}
                {mode !== 'forgot' && (
                  <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className={cn(
                        'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                        mode === 'login'
                          ? 'bg-[#5561f0] text-white shadow-md'
                          : 'text-white/50 hover:text-white'
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className={cn(
                        'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                        mode === 'signup'
                          ? 'bg-[#5561f0] text-white shadow-md'
                          : 'text-white/50 hover:text-white'
                      )}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* Forgot-sent confirmation */}
                {mode === 'forgot' && forgotSent ? (
                  <div className="rounded-xl border border-[#34d399]/20 bg-[#34d399]/10 p-4 text-center">
                    <Check size={20} className="mx-auto mb-2 text-[#34d399]" />
                    <p className="text-[13.5px] font-semibold text-[#34d399]">Recovery link sent!</p>
                    <p className="mt-1 text-[12px] text-white/40">Check your email inbox.</p>
                    <button
                      onClick={() => switchMode('login')}
                      className="mt-3 text-[12.5px] font-medium text-white/40 underline underline-offset-2 transition-colors hover:text-white/70"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                      {/* Name — signup only */}
                      {mode === 'signup' && (
                        <TextInput
                          label="Full name"
                          type="text"
                          placeholder="e.g. Alex Morgan"
                          autoComplete="name"
                          value={fields.name}
                          onChange={set('name')}
                          error={errors.name}
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                          }
                        />
                      )}

                      {/* Email */}
                      <TextInput
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        ref={emailRef}
                        value={fields.email}
                        onChange={set('email')}
                        error={errors.email}
                        icon={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m2 7 10 7 10-7" />
                          </svg>
                        }
                      />

                      {/* Password */}
                      {mode !== 'forgot' && (
                        <TextInput
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          value={fields.password}
                          onChange={set('password')}
                          error={errors.password}
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          }
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              className="text-white/25 transition-colors hover:text-white/60"
                            >
                              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          }
                        />
                      )}

                      {/* Forgot password link */}
                      {mode === 'login' && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-[12px] text-white/30 transition-colors hover:text-white/60"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* General error */}
                      {errors.general && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-red-400">
                          <AlertCircle size={13} />
                          {errors.general}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={anyLoading}
                        className={cn(
                          'group relative mt-1 flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden',
                          'rounded-xl text-[13.5px] font-semibold tracking-[-0.01em] text-white',
                          'transition-all duration-200 active:scale-[0.98]',
                          'disabled:pointer-events-none disabled:opacity-50',
                        )}
                        style={{
                          background: 'linear-gradient(135deg, #5561f0 0%, #7c87ff 100%)',
                          boxShadow: '0 4px 20px -6px rgba(85,97,240,0.65), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                      >
                        {/* Shimmer overlay */}
                        <span
                          className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/[0.07] transition-transform duration-700 group-hover:translate-x-full"
                          aria-hidden
                        />

                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <span>
                              {mode === 'login'
                                ? 'Sign in'
                                : mode === 'signup'
                                ? 'Create account'
                                : 'Send reset link'}
                            </span>
                            <ArrowRight
                              size={15}
                              className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Mode switcher */}
                    <p className="text-center text-[12.5px] text-white/30">
                      {mode === 'login' ? (
                        <>
                          New here?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            className="font-semibold text-white/60 underline underline-offset-2 transition-colors hover:text-white"
                          >
                            Create an account
                          </button>
                        </>
                      ) : mode === 'signup' ? (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="font-semibold text-white/60 underline underline-offset-2 transition-colors hover:text-white"
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className="font-semibold text-white/60 underline underline-offset-2 transition-colors hover:text-white"
                        >
                          ← Back to sign in
                        </button>
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-[11.5px] text-white/20">
            By continuing, you agree to our{' '}
            <span className="cursor-pointer underline underline-offset-2 transition-colors hover:text-white/40">
              Terms
            </span>{' '}
            &{' '}
            <span className="cursor-pointer underline underline-offset-2 transition-colors hover:text-white/40">
              Privacy Policy
            </span>
            . Your data stays on your device.
          </p>
        </div>

      </div>
    </>
  )
}
