import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'HR') {
        navigate('/hr/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      const backendMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[rgb(var(--bg-page))] px-4">
      {/* ── Decorative background layer ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large faint circle outlines */}
        <svg className="absolute -left-24 -top-24 h-72 w-72 text-brand-300/40 dark:text-brand-700/30" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -right-32 bottom-10 h-96 w-96 text-brand-300/30 dark:text-brand-700/20" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="1" />
        </svg>
        <div className="absolute right-[12%] top-[10%] h-2 w-2 rounded-full bg-brand-400/60 dark:bg-brand-500/50" />
        <div className="absolute bottom-[22%] left-[16%] h-1.5 w-1.5 rounded-full bg-brand-400/60 dark:bg-brand-500/50" />
        <div className="absolute right-[8%] top-[55%] h-1.5 w-1.5 rounded-full bg-brand-400/50 dark:bg-brand-500/40" />

        {/* Dot grids, top-left and bottom-right */}
        <svg className="absolute left-10 top-10 h-28 w-28 text-brand-300/50 dark:text-brand-600/40" viewBox="0 0 100 100">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 22 + 6} cy={row * 22 + 6} r="2" fill="currentColor" />
            ))
          )}
        </svg>
        <svg className="absolute bottom-12 right-12 h-32 w-32 text-brand-300/50 dark:text-brand-600/40" viewBox="0 0 100 100">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 22 + 6} cy={row * 22 + 6} r="2" fill="currentColor" />
            ))
          )}
        </svg>

        {/* Flowing line art */}
        <svg
          className="absolute inset-0 h-full w-full text-brand-300/40 dark:text-brand-700/30"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-100 480 C 250 380, 420 560, 680 460 C 940 360, 1100 520, 1540 380"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M-100 510 C 260 410, 430 590, 690 490 C 950 390, 1110 550, 1540 410"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
          <path
            d="M900 200 C 1050 280, 1150 220, 1540 120"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>

        {/* Bar chart silhouette, bottom-left */}
        <svg
          className="absolute bottom-0 left-0 h-64 w-72 text-brand-300/50 dark:text-brand-700/40"
          viewBox="0 0 280 220"
          fill="currentColor"
        >
          <rect x="20" y="140" width="22" height="80" />
          <rect x="55" y="100" width="22" height="120" />
          <rect x="90" y="160" width="22" height="60" />
          <rect x="125" y="70" width="22" height="150" />
          <rect x="160" y="120" width="22" height="100" />
          <rect x="195" y="40" width="22" height="180" />
        </svg>
      </div>

      {/* ── Login card ── */}
      <div className="relative z-10 w-full max-w-[26rem]">
        <div className="rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-8 shadow-card">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-brand-500 text-2xl font-bold text-brand-600 dark:text-brand-400">
              A
            </div>
            <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-[rgb(var(--text-primary))]">
              Appraise
            </h1>
            <p className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">
              A Performance Management System
            </p>
          </div>

          <div className="mt-7 text-center">
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Welcome Back</h2>
            <p className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">
              Glad to see you again. Let's continue your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
              </svg>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] py-2.5 pl-10 pr-3.5 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="11" width="16" height="9" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] py-2.5 pl-10 pr-10 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-brand-600 dark:hover:text-brand-400"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 1 0 2.83 2.83M9.88 4.24A9.93 9.93 0 0 1 12 4c5 0 9 4 10 8a10.4 10.4 0 0 1-2.18 3.5M6.1 6.1A10.4 10.4 0 0 0 2 12c1 4 5 8 10 8a9.9 9.9 0 0 0 4.02-.84" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgb(var(--border-subtle))]" />
            <svg className="h-4 w-4 text-[rgb(var(--text-muted))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
            </svg>
            <div className="h-px flex-1 bg-[rgb(var(--border-subtle))]" />
          </div>

          <p className="mt-5 text-center text-sm italic text-[rgb(var(--text-secondary))]">
            "Growth is measured by the progress you make every day."
          </p>
        </div>
      </div>
    </div>
  );
}