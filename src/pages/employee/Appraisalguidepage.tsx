import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';

type Tab = 'guide' | 'sample';

const RATING_SCALE = [
  { stars: 1, label: 'Below expectations' },
  { stars: 2, label: 'Needs improvement' },
  { stars: 3, label: 'Meets expectations' },
  { stars: 4, label: 'Exceeds expectations' },
  { stars: 5, label: 'Outstanding' },
];

const QUICK_TIPS = [
  'Be specific, not vague',
  'Use numbers when possible',
  'Honest beats impressive',
  'Save draft before submitting',
  'Review your tasks first',
  'Submit only when ready — it locks',
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icons.Star
          key={i}
          filled={i < count}
          className={`h-4 w-4 ${i < count ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'}`}
        />
      ))}
    </div>
  );
}

export function AppraisalGuidePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('guide');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-[rgb(var(--text-primary))]">
            Welcome, {user?.name} 👋
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Read the guide before filling your self appraisal.
          </p>
        </div>
        <Link
          to="/employee/appraisals"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          My Appraisals
          <Icons.ChevronDown className="h-4 w-4 -rotate-90" />
        </Link>
      </div>

      <div className="flex gap-6 border-b border-[rgb(var(--border-subtle))]">
        <button
          onClick={() => setTab('guide')}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            tab === 'guide'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
          }`}
        >
          Appraisal Guide
        </button>
        <button
          onClick={() => setTab('sample')}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            tab === 'sample'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
          }`}
        >
          Sample Appraisal Form
        </button>
      </div>

      {tab === 'guide' ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              A self appraisal is your chance to tell your manager what you did, what you learned,
              and where you want to grow —{' '}
              <span className="font-semibold text-[rgb(var(--text-primary))]">
                before they write their review.
              </span>{' '}
              Be honest and specific. Managers use this to calibrate their rating.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  What Went Well
                </h3>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                Your top 2–3 contributions. Focus on impact, not just activity.
              </p>
              <p className="mt-2 text-xs italic text-[rgb(var(--text-muted))]">
                e.g. Led the JWT migration on time, mentored 2 juniors.
              </p>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  What To Improve
                </h3>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                One honest area where you fell short. Show you understand the gap.
              </p>
              <p className="mt-2 text-xs italic text-[rgb(var(--text-muted))]">
                e.g. Underestimated task complexity — will add 20% buffer going forward.
              </p>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  Key Achievements
                </h3>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                Specific wins — features shipped, certs earned, problems solved.
              </p>
              <p className="mt-2 text-xs italic text-[rgb(var(--text-muted))]">
                e.g. Delivered auth module · Completed AWS cert · Resolved 12 bugs
              </p>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  Self Rating (1–5)
                </h3>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                Rate yourself honestly. A 4/5 with strong examples beats a 5/5 with none.
              </p>
              <p className="mt-2 text-xs italic text-[rgb(var(--text-muted))]">
                e.g. 4 = Exceeds expectations · 3 = Meets expectations
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Rating Scale
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              {RATING_SCALE.map((r) => (
                <div key={r.stars} className="text-center">
                  <div className="flex justify-center">
                    <StarRow count={r.stars} />
                  </div>
                  <p className="mt-1.5 text-xs text-[rgb(var(--text-muted))]">{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Quick Tips
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TIPS.map((tip) => (
                <span
                  key={tip}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          <div className="bg-surface-900 px-5 py-3 text-white dark:bg-brand-700">
            <h3 className="text-sm font-semibold">Self Appraisal Form</h3>
            <p className="text-xs text-surface-300 dark:text-brand-100">
              Q1 2025 · Jan 1 — Mar 31, 2025
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-3 border-b border-[rgb(var(--border-subtle))] pb-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Employee</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Alex Johnson</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Manager</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Sarah Chen</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Department</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Engineering</p>
              </div>
            </div>

            <div className="space-y-5 pt-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    What Went Well
                  </h4>
                </div>
                <p className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">
                  Led the JWT authentication migration on time, completing it within the sprint.
                  Collaborated closely with the backend team to ensure zero downtime. Mentored 2
                  junior developers on REST API best practices, improving code review turnaround
                  by 30%.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    What To Improve
                  </h4>
                </div>
                <p className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">
                  Underestimated task complexity twice this cycle — both times by about 2 days.
                  Going forward I'll break large tasks into sub-tasks and add a 20% time buffer to
                  my estimates.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    Key Achievements
                  </h4>
                </div>
                <ul className="mt-1.5 space-y-1 text-sm text-[rgb(var(--text-secondary))]">
                  <li>• Delivered JWT auth module (Q1 sprint goal)</li>
                  <li>• Reduced API response time by 35% through query optimization</li>
                  <li>• Completed AWS Cloud Practitioner certification</li>
                  <li>• Resolved 12 critical backlog bugs</li>
                  <li>• Onboarded and mentored 2 new team members</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    Self Rating
                  </h4>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <StarRow count={4} />
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">4 / 5</span>
                  <span className="text-sm text-[rgb(var(--text-muted))]">— Exceeds expectations</span>
                </div>
                <p className="mt-1 text-xs italic text-[rgb(var(--text-muted))]">
                  Chose 4 because I delivered all goals but had estimation issues that caused minor
                  delays.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[rgb(var(--border-subtle))] bg-brand-50/40 p-5 sm:grid-cols-2 dark:bg-surface-800/40">
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Icons.Check className="h-3.5 w-3.5" /> What works here
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-[rgb(var(--text-secondary))]">
                <li>Specific numbers — "30%", "35%", "12 bugs"</li>
                <li>Honest about weakness with a concrete fix</li>
                <li>Rating is backed by evidence</li>
                <li>Achievements are bullet-pointed and scannable</li>
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <Icons.Close className="h-3.5 w-3.5" /> Avoid these
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-[rgb(var(--text-secondary))]">
                <li>"I worked hard" — too vague</li>
                <li>"I did my best" — no evidence</li>
                <li>Rating 5/5 with no explanation</li>
                <li>Leaving any field blank</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}