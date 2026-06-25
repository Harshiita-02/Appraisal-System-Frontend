import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services/employeeService';
import type { EmployeeDashboardData, Goal, GoalStatus } from '@/types';
import { GOAL_STATUS_LABELS } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Icons } from '@/components/Icons';

const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-surface-200 text-[rgb(var(--text-secondary))] dark:bg-surface-800',
  IN_PROGRESS:  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  COMPLETED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [data, setData]   = useState<EmployeeDashboardData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      employeeService.getDashboard(user.id),
      employeeService.getMyGoals(user.id),
    ])
      .then(([dashData, goalList]) => {
        setData(dashData);
        setGoals(goalList);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading dashboard…
      </div>
    );
  }

  // Sort goals: non-completed first, then by due date ascending
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
    if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
          Welcome, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{user?.jobTitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Appraisals"    value={data.activeAppraisals} />
        <StatCard label="Goals In Progress"    value={data.goalsInProgress} />
        <StatCard label="Unread Notifications" value={data.unreadNotifications} />
      </div>

      {/* Two-column row: My Appraisals + Upcoming Goal Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── My Appraisals ── */}
        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          <h2 className="border-b border-[rgb(var(--border-subtle))] p-5 text-sm font-semibold text-[rgb(var(--text-primary))]">
            My Appraisals
          </h2>

          {data.appraisals.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
              No appraisals yet.
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border-subtle))]">
              {data.appraisals.map((a) => {
                const canFill = a.status === 'PENDING' || a.status === 'EMPLOYEE_DRAFT';
                return (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                        {a.cycle}
                      </div>
                      <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                        Manager: {a.managerName}
                        {a.startDate && a.endDate && (
                          <> · {formatDate(a.startDate)} — {formatDate(a.endDate)}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {canFill ? (
                        <Link
                          to="/employee/appraisals"
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          {a.status === 'EMPLOYEE_DRAFT' ? 'Continue Self Assessment' : 'Fill Self Assessment'}
                        </Link>
                      ) : (
                        <Link
                          to="/employee/appraisals"
                          className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Upcoming Goal Deadlines ── */}
        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border-subtle))] p-5">
            <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
              Upcoming Goal Deadlines
            </h2>
            <Link
              to="/employee/goals"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all →
            </Link>
          </div>

          {sortedGoals.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
              No goals assigned yet.
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border-subtle))]">
              {sortedGoals.slice(0, 4).map((goal) => {
                const remaining = daysUntil(goal.dueDate);
                const isOverdue = remaining < 0 && goal.status !== 'COMPLETED';
                return (
                  <Link
                    key={goal.id}
                    to="/employee/goals"
                    className="flex items-start justify-between gap-3 p-4 hover:bg-brand-50/40 dark:hover:bg-surface-800/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[rgb(var(--text-primary))]">
                        {goal.title}
                      </div>
                      {goal.description && (
                        <div className="mt-0.5 truncate text-xs text-[rgb(var(--text-muted))]">
                          {goal.description}
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                        <Icons.Clock className="h-3 w-3 shrink-0" />
                        <span>Due {formatDate(goal.dueDate)}</span>
                        {isOverdue ? (
                          <span className="font-semibold text-red-500">· Overdue</span>
                        ) : goal.status !== 'COMPLETED' ? (
                          <span>· {remaining}d left</span>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${GOAL_STATUS_STYLES[goal.status]}`}
                    >
                      {GOAL_STATUS_LABELS[goal.status]}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}