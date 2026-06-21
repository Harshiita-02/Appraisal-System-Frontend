import { useEffect, useState } from 'react';
import { hrService } from '@/services/hrService';
import { APPRAISAL_STATUS_LABELS, type Cycle, type CycleReport } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';

const STATUS_BAR_COLORS: Record<string, string> = {
  PENDING: 'bg-surface-300 dark:bg-surface-700',
  EMPLOYEE_DRAFT: 'bg-amber-400',
  SELF_SUBMITTED: 'bg-sky-400',
  MANAGER_DRAFT: 'bg-amber-400',
  MANAGER_REVIEWED: 'bg-sky-400',
  APPROVED: 'bg-emerald-400',
  ACKNOWLEDGED: 'bg-brand-500',
};

export function ReportsPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [report, setReport] = useState<CycleReport | null>(null);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useEffect(() => {
    hrService.getCycles().then((list) => {
      setCycles(list);
      if (list.length > 0) setSelectedCycleId(list[0].id);
      setIsLoadingCycles(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCycleId) return;
    setIsLoadingReport(true);
    hrService
      .getCycleReport(selectedCycleId)
      .then(setReport)
      .finally(() => setIsLoadingReport(false));
  }, [selectedCycleId]);

  const maxStatusCount = report
    ? Math.max(1, ...report.statusBreakdown.map((s) => s.count))
    : 1;
  const maxRatingCount = report
    ? Math.max(1, ...report.ratingDistribution.map((r) => r.count))
    : 1;
  const totalRated = report
    ? report.ratingDistribution.reduce((sum, r) => sum + r.count, 0)
    : 0;

  if (isLoadingCycles) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Reports</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Cycle analytics and performance insights
        </p>
      </div>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
          Select Cycle
        </label>
        <select
          value={selectedCycleId}
          onChange={(e) => setSelectedCycleId(e.target.value)}
          className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoadingReport || !report ? (
        <div className="flex items-center justify-center py-16 text-sm text-[rgb(var(--text-muted))]">
          Loading report data…
        </div>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Cycle Overview — {report.cycle}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Appraisals" value={report.totalAppraisals} />
              <StatCard label="Completion" value={`${report.completionPercent}%`} />
              <StatCard label="Pending Action" value={report.pendingActionCount} />
              <StatCard label="Avg Rating" value={report.avgRating ? `${report.avgRating}/5` : '—'} />
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-[rgb(var(--text-primary))]">
              Status Breakdown
            </h3>
            <div className="space-y-3">
              {report.statusBreakdown.map((entry) => (
                <div key={entry.status} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-[rgb(var(--text-secondary))]">
                    {APPRAISAL_STATUS_LABELS[entry.status]}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLORS[entry.status]}`}
                      style={{ width: `${(entry.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-medium text-[rgb(var(--text-primary))]">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                Rating Distribution
              </h3>
              <span className="text-xs text-[rgb(var(--text-muted))]">
                {totalRated} rated{report.avgRating ? ` · avg ${report.avgRating}` : ''}
              </span>
            </div>
            <div className="space-y-3">
              {report.ratingDistribution.map((entry) => (
                <div key={entry.rating} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-sm text-[rgb(var(--text-secondary))]">
                    {entry.rating} ★
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(entry.count / maxRatingCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-medium text-[rgb(var(--text-primary))]">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
            <h3 className="border-b border-[rgb(var(--border-subtle))] p-5 text-sm font-semibold text-[rgb(var(--text-primary))]">
              By Department
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Employees</th>
                    <th className="px-5 py-3 font-medium">Completed</th>
                    <th className="px-5 py-3 font-medium">Pending</th>
                    <th className="px-5 py-3 font-medium">Avg Rating</th>
                    <th className="px-5 py-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byDepartment.map((row) => {
                    const total = row.completed + row.pending;
                    const progress = total > 0 ? Math.round((row.completed / total) * 100) : 0;
                    return (
                      <tr
                        key={row.department}
                        className="border-b border-[rgb(var(--border-subtle))] last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-[rgb(var(--text-primary))]">
                          {row.department}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.employees}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.completed}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.pending}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.avgRating ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                              <div
                                className="h-full rounded-full bg-brand-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border-subtle))] p-5">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                Pending Actions
              </h3>
              <span className="text-xs text-[rgb(var(--text-muted))]">
                {report.pendingActions.length} not yet acknowledged
              </span>
            </div>
            {report.pendingActions.length === 0 ? (
              <div className="p-8 text-center text-sm text-[rgb(var(--text-muted))]">
                Nothing pending — everyone in this cycle is acknowledged.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                      <th className="px-5 py-3 font-medium">Employee</th>
                      <th className="px-5 py-3 font-medium">Department</th>
                      <th className="px-5 py-3 font-medium">Manager</th>
                      <th className="px-5 py-3 font-medium">Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pendingActions.map((row, idx) => (
                      <tr
                        key={`${row.employeeName}-${idx}`}
                        className="border-b border-[rgb(var(--border-subtle))] last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-[rgb(var(--text-primary))]">
                          {row.employeeName}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.department}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.managerName}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}