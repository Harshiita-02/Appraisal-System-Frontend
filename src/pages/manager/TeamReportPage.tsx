import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import type { Cycle, TeamReport } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';

export function TeamReportPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [report, setReport] = useState<TeamReport | null>(null);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useEffect(() => {
    managerService.getCycles().then((list) => {
      setCycles(list);
      if (list.length > 0) setSelectedCycleId(list[0].id);
      setIsLoadingCycles(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !selectedCycleId) return;
    setIsLoadingReport(true);
    managerService
      .getTeamReport(user.id, selectedCycleId)
      .then(setReport)
      .finally(() => setIsLoadingReport(false));
  }, [user, selectedCycleId]);

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
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Team Report</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Performance overview for your team by cycle
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
          <option value="">Choose a cycle...</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCycleId ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] text-sm text-[rgb(var(--text-muted))]">
          Select a cycle to view your team report
        </div>
      ) : isLoadingReport || !report ? (
        <div className="flex items-center justify-center py-16 text-sm text-[rgb(var(--text-muted))]">
          Loading report…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Team Members" value={report.teamMembers} />
            <StatCard label="Avg Rating" value={report.avgRating ? `${report.avgRating} / 5` : '—'} />
            <StatCard label="Cycle" value={report.cycle} />
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
            <h3 className="border-b border-[rgb(var(--border-subtle))] p-5 text-sm font-semibold text-[rgb(var(--text-primary))]">
              Team Members
            </h3>

            {report.rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
                No team members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                      <th className="px-5 py-3 font-medium">Employee</th>
                      <th className="px-5 py-3 font-medium">Job Title</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Self Rating</th>
                      <th className="px-5 py-3 font-medium">My Rating</th>
                      <th className="px-5 py-3 font-medium">Goals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row) => (
                      <tr
                        key={row.employeeId}
                        className="border-b border-[rgb(var(--border-subtle))] last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-[rgb(var(--text-primary))]">
                          {row.employeeName}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.jobTitle}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-5 py-3">
                          <StarRating value={row.selfRating} />
                        </td>
                        <td className="px-5 py-3">
                          <StarRating value={row.managerRating} />
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                          {row.goalsCompleted}/{row.goalsTotal}
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