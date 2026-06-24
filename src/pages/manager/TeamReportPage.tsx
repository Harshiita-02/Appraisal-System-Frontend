import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import { apiClient } from '@/services/apiClient';
import type { Cycle, TeamReport } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

// The row shape coming back from the backend team report
interface TeamRow {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  status: string;
  selfRating?: number | null;
  managerRating?: number | null;
  goalsCompleted: number;
  goalsTotal: number;
  appraisalId?: string | null;   // needed to submit review
  selfAssessment?: {
    whatWentWell?: string;
    whatToImprove?: string;
    keyAchievements?: string;
  } | null;
}

export function TeamReportPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [report, setReport] = useState<TeamReport | null>(null);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Review modal state
  const [reviewRow, setReviewRow] = useState<TeamRow | null>(null);
  const [managerRating, setManagerRating] = useState(0);
  const [finalComment, setFinalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  function openReviewModal(row: TeamRow) {
    setReviewRow(row);
    setManagerRating(0);
    setFinalComment('');
    setReviewError(null);
  }

  function closeReviewModal() {
    setReviewRow(null);
    setReviewError(null);
  }

  async function handleSubmitReview() {
    if (!reviewRow || !user) return;

    if (managerRating < 1) {
      setReviewError('Please select a rating before submitting.');
      return;
    }

    if (!reviewRow.appraisalId) {
      setReviewError('Cannot find appraisal ID for this employee. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setReviewError(null);

    try {
      await apiClient.post(
        `/manager/appraisals/${reviewRow.appraisalId}/review`,
        { managerRating, finalComment },
        { params: { managerId: user.id } }
      );
      closeReviewModal();
      // Refresh the report
      setIsLoadingReport(true);
      managerService
        .getTeamReport(user.id, selectedCycleId)
        .then(setReport)
        .finally(() => setIsLoadingReport(false));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not submit review. Please try again.';
      setReviewError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingCycles) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading…
      </div>
    );
  }

  const rows: TeamRow[] = (report as any)?.rows ?? [];

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

            {rows.length === 0 ? (
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
                    {rows.map((row) => {
                      // Manager can only review when employee has submitted (SUBMITTED status)
                      const canReview = row.status === 'SUBMITTED';
                      const alreadyReviewed =
                        row.status === 'REVIEWED' || row.status === 'COMPLETED';

                      return (
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
                            <StatusBadge status={row.status as any} />
                          </td>
                          <td className="px-5 py-3">
                            <StarRating value={row.selfRating ?? null} />
                          </td>
                          <td className="px-5 py-3">
                            <StarRating value={row.managerRating ?? null} />
                          </td>
                          <td className="px-5 py-3 text-[rgb(var(--text-secondary))]">
                            {row.goalsCompleted}/{row.goalsTotal}
                          </td>
                          <td className="px-5 py-3">
                            {canReview ? (
                              <button
                                onClick={() => openReviewModal(row)}
                                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                              >
                                Review
                              </button>
                            ) : alreadyReviewed ? (
                              <button
                                onClick={() => openReviewModal(row)}
                                className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
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
        </>
      )}

      {/* ── Review Modal ── */}
      <Modal
        isOpen={!!reviewRow}
        onClose={closeReviewModal}
        title={
          reviewRow?.status === 'SUBMITTED'
            ? `Review — ${reviewRow?.employeeName}`
            : `View Review — ${reviewRow?.employeeName}`
        }
        description={
          reviewRow?.status === 'SUBMITTED'
            ? "Read the employee's self-assessment and submit your rating."
            : 'Manager review already submitted.'
        }
      >
        {reviewRow && (
          <div className="space-y-5">

            {/* Employee self-assessment (read-only) */}
            {reviewRow.selfAssessment && (
              <div className="space-y-3 rounded-lg bg-[rgb(var(--bg-subtle,var(--bg-card)))] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  Employee Self-Assessment
                </p>

                {reviewRow.selfAssessment.whatWentWell && (
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">What Went Well</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{reviewRow.selfAssessment.whatWentWell}</p>
                  </div>
                )}
                {reviewRow.selfAssessment.whatToImprove && (
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">What to Improve</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{reviewRow.selfAssessment.whatToImprove}</p>
                  </div>
                )}
                {reviewRow.selfAssessment.keyAchievements && (
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Key Achievements</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{reviewRow.selfAssessment.keyAchievements}</p>
                  </div>
                )}

                {reviewRow.selfRating != null && (
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Self Rating</p>
                    <StarRating value={reviewRow.selfRating} />
                  </div>
                )}
              </div>
            )}

            {/* Manager rating input */}
            {reviewRow.status === 'SUBMITTED' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setManagerRating(val)}
                        aria-label={`Rate ${val} out of 5`}
                      >
                        <Icons.Star
                          filled={val <= managerRating}
                          className={`h-6 w-6 ${
                            val <= managerRating
                              ? 'text-amber-400'
                              : 'text-surface-300 dark:text-surface-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Click a star to rate</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                    Comments / Feedback
                  </label>
                  <textarea
                    value={finalComment}
                    onChange={(e) => setFinalComment(e.target.value)}
                    rows={4}
                    placeholder="Add your feedback, observations, and recommendations for the employee..."
                    className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </>
            )}

            {/* Already reviewed — show manager rating read-only */}
            {reviewRow.status !== 'SUBMITTED' && reviewRow.managerRating != null && (
              <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-900/20">
                <span className="font-medium text-brand-700 dark:text-brand-300">Your rating: </span>
                <StarRating value={reviewRow.managerRating} />
              </div>
            )}

            {reviewError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {reviewError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeReviewModal}
                className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
              >
                {reviewRow.status === 'SUBMITTED' ? 'Cancel' : 'Close'}
              </button>
              {reviewRow.status === 'SUBMITTED' && (
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}