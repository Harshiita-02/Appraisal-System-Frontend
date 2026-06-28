import { useEffect, useState } from 'react';
import { managerService } from '@/services/managerService';
import type { Cycle, TeamReport, TeamReportRow } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

export function TeamReportPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [report, setReport] = useState<TeamReport | null>(null);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [cyclesError, setCyclesError] = useState<string | null>(null);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<TeamReportRow | null>(null);
  const [managerRating, setManagerRating] = useState(0);
  const [managerComments, setManagerComments] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => {
    managerService
      .getCycles()
      .then((list) => {
        setCycles(list);
        if (list.length > 0) setSelectedCycleId(list[0].id);
      })
      .catch(() => {
        setCyclesError('Could not load appraisal cycles. Please try again.');
      })
      .finally(() => setIsLoadingCycles(false));
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedCycleId]);

  function loadReport() {
    if (!selectedCycleId) return;
    setIsLoadingReport(true);
    managerService
      .getTeamReport(selectedCycleId)
      .then(setReport)
      .finally(() => setIsLoadingReport(false));
  }

  // Only rows where the employee has actually submitted their side (or the
  // manager already started a review draft) are reviewable. Uses the real
  // 7-stage workflow statuses, not the old SUBMITTED/REVIEWED pair.
  function canReview(row: TeamReportRow): boolean {
    return (
      row.appraisalId != null &&
      (row.status === 'SELF_SUBMITTED' || row.status === 'MANAGER_DRAFT')
    );
  }

  function openReviewModal(row: TeamReportRow) {
    setReviewTarget(row);
    setManagerRating(row.managerRating ?? 0);
    setManagerComments('');
    setReviewError(null);
  }

  function closeReviewModal() {
    setReviewTarget(null);
    setReviewError(null);
  }

  async function handleSaveReview(submit: boolean) {
    if (!reviewTarget || !reviewTarget.appraisalId) return;
    setReviewError(null);

    if (submit && managerRating < 1) {
      setReviewError('Please select a rating before submitting.');
      return;
    }

    setIsSavingReview(true);
    try {
      await managerService.reviewTeamAppraisal(
        reviewTarget.appraisalId,
        { managerRating: managerRating || 1, managerComments },
        submit
      );
      closeReviewModal();
      loadReport();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Could not save this review. Please try again.'
      );
    } finally {
      setIsSavingReview(false);
    }
  }

  if (isLoadingCycles) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[rgb(var(--text-muted))]">
        Loading…
      </div>
    );
  }

  if (cyclesError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{cyclesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
        >
          Retry
        </button>
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
        <div className="flex min-h-[200px] items-center justify-center py-16 text-sm text-[rgb(var(--text-muted))]">
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
                      <th className="px-5 py-3 font-medium">Actions</th>
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
                        <td className="px-5 py-3">
                          {canReview(row) ? (
                            <button
                              onClick={() => openReviewModal(row)}
                              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            >
                              {row.status === 'MANAGER_DRAFT' ? 'Continue Review' : 'Review'}
                            </button>
                          ) : (
                            <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                          )}
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

      <Modal
        isOpen={!!reviewTarget}
        onClose={closeReviewModal}
        title="Review Appraisal"
        description={reviewTarget ? `${reviewTarget.employeeName} — ${reviewTarget.jobTitle}` : undefined}
      >
        <div className="space-y-4">
          {reviewTarget?.selfRating != null && (
            <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-900/20">
              <span className="font-medium text-brand-700 dark:text-brand-300">Self rating: </span>
              <StarRating value={reviewTarget.selfRating} />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setManagerRating(value)}
                  aria-label={`Rate ${value} out of 5`}
                >
                  <Icons.Star
                    filled={value <= managerRating}
                    className={`h-6 w-6 ${
                      value <= managerRating
                        ? 'text-amber-400'
                        : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Comments
            </label>
            <textarea
              value={managerComments}
              onChange={(e) => setManagerComments(e.target.value)}
              rows={4}
              placeholder="Your feedback on this employee's performance..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {reviewError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {reviewError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={closeReviewModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveReview(false)}
              disabled={isSavingReview}
              className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-surface-800"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSaveReview(true)}
              disabled={isSavingReview}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}