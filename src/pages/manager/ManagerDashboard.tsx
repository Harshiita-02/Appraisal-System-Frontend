import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import type { ManagerDashboardData } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ManagerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    managerService
      .getDashboard(user.id)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
          Welcome, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{user?.jobTitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team Size" value={data.summary.teamSize} />
        <StatCard label="Active Reviews" value={data.summary.activeReviews} />
        <StatCard label="Awaiting My Review" value={data.summary.awaitingMyReview} />
        <StatCard label="Completed" value={data.summary.completed} />
      </div>

      {/* My Appraisals — as an employee reporting to my own manager */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">My Appraisals</h2>
          <span className="text-xs text-[rgb(var(--text-muted))]">
            — as an employee reporting to your manager
          </span>
        </div>

        {data.myAppraisals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">
            No appraisals assigned to you yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data.myAppraisals.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-card"
              >
                <div>
                  <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {a.cycle}
                  </div>
                  <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                    Reviewed by: {a.managerName}
                    {a.startDate && a.endDate && (
                      <> · {formatDate(a.startDate)} — {formatDate(a.endDate)}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <Link
                    to="/manager/my-appraisals"
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Fill Self Assessment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Appraisals — reviews the manager needs to complete */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
            Team Appraisals
          </h2>
          <span className="text-xs text-[rgb(var(--text-muted))]">
            — reviews you need to complete
          </span>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          {data.teamAppraisals.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
              No team appraisals yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Cycle</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Self Rating</th>
                    <th className="px-4 py-3 font-medium">My Rating</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teamAppraisals.map((a) => {
                    const canReview = a.status === 'SELF_SUBMITTED' || a.status === 'MANAGER_DRAFT';
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">
                          {a.employeeName}
                        </td>
                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{a.cycle}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3">
                          <StarRating value={a.selfRating} />
                        </td>
                        <td className="px-4 py-3">
                          <StarRating value={a.managerRating} />
                        </td>
                        <td className="px-4 py-3">
                          {canReview ? (
                            <Link
                              to="/manager/team"
                              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            >
                              Review
                            </Link>
                          ) : (
                            <Link
                              to="/manager/team"
                              className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                            >
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}