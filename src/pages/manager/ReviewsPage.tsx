import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import type { Appraisal } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

export function ReviewsPage() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reviewTarget, setReviewTarget] = useState<Appraisal | null>(null);
  const [managerRating, setManagerRating] = useState(0);
  const [managerComments, setManagerComments] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => { loadData(); }, [user]);

  function loadData() {
    if (!user) return;
    setIsLoading(true);
    managerService
      .getAssignableAppraisals(user.id)
      .then(setAppraisals)
      .finally(() => setIsLoading(false));
  }

  // Needs action
  const pendingReview = appraisals.filter(
    (a) => a.status === 'SELF_SUBMITTED' || a.status === 'MANAGER_DRAFT'
  );

  // Already reviewed — show as history
  const completedReview = appraisals.filter((a) =>
    ['MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'].includes(a.status)
  );

  function openReviewModal(appraisal: Appraisal) {
    setReviewTarget(appraisal);
    setManagerRating(appraisal.managerRating ?? 0);
    setManagerComments(appraisal.managerComments ?? '');
    setReviewError(null);
  }

  function closeReviewModal() {
    setReviewTarget(null);
    setReviewError(null);
  }

  async function handleSaveReview(submit: boolean) {
    if (!reviewTarget || !user) return;
    if (['MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'].includes(reviewTarget.status)) return;
    setReviewError(null);

    if (submit && managerRating < 1) {
      setReviewError('Please select a rating before submitting.');
      return;
    }

    setIsSavingReview(true);
    try {
      await managerService.reviewTeamAppraisal(
        reviewTarget.id,
        { managerRating: managerRating || 1, managerComments },
        user.id,
        submit
      );
      closeReviewModal();
      loadData();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Could not save this review. Please try again.'
      );
    } finally {
      setIsSavingReview(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading reviews…
      </div>
    );
  }

  const inputClass = 'w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
  const isReviewLocked = reviewTarget
    ? ['MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'].includes(reviewTarget.status)
    : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Reviews</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Team appraisals waiting on your review, across every cycle
        </p>
      </div>

      {/* ── Pending Reviews ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
          Pending Review
          {pendingReview.length > 0 && (
            <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
              {pendingReview.length}
            </span>
          )}
        </h2>
        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          {pendingReview.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
              Nothing waiting on your review right now.
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
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReview.map((a) => (
                    <tr key={a.id} className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">{a.employeeName}</td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{a.cycle}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3"><StarRating value={a.selfRating} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openReviewModal(a)}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          {a.status === 'MANAGER_DRAFT' ? 'Continue Review' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Completed Reviews History ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
          Review History
        </h2>
        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          {completedReview.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
              No completed reviews yet.
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
                    <th className="px-4 py-3 font-medium">Comments</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReview.map((a) => (
                    <tr key={a.id} className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">{a.employeeName}</td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{a.cycle}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3"><StarRating value={a.selfRating} /></td>
                      <td className="px-4 py-3"><StarRating value={a.managerRating} /></td>
                      <td className="px-4 py-3 max-w-xs">
                        {a.managerComments ? (
                          <p className="truncate text-sm text-[rgb(var(--text-secondary))]" title={a.managerComments}>
                            {a.managerComments}
                          </p>
                        ) : (
                          <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openReviewModal(a)}
                          className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Review Modal ── */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={closeReviewModal}
        title="Review Appraisal"
        description={reviewTarget ? `${reviewTarget.employeeName} — ${reviewTarget.cycle}` : undefined}
      >
        <div className="space-y-4">
          {reviewTarget?.selfRating != null && (
            <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-900/20">
              <span className="font-medium text-brand-700 dark:text-brand-300">Self rating: </span>
              <StarRating value={reviewTarget.selfRating} />
            </div>
          )}

          {reviewTarget?.whatWentWell && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--text-muted))]">What Went Well</p>
              <p className="text-sm text-[rgb(var(--text-primary))]">{reviewTarget.whatWentWell}</p>
            </div>
          )}
          {reviewTarget?.whatToImprove && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--text-muted))]">What Could Improve</p>
              <p className="text-sm text-[rgb(var(--text-primary))]">{reviewTarget.whatToImprove}</p>
            </div>
          )}
          {reviewTarget?.keyAchievements && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--text-muted))]">Key Achievements</p>
              <p className="text-sm text-[rgb(var(--text-primary))]">{reviewTarget.keyAchievements}</p>
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
                    className={`h-6 w-6 ${value <= managerRating ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'}`}
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
              className={inputClass + ' resize-none'}
            />
          </div>

          {reviewError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {reviewError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={closeReviewModal} className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800">
              Cancel
            </button>
            <button
              onClick={() => handleSaveReview(false)}
              disabled={isSavingReview || isReviewLocked}
              className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-surface-800"
            >
              {isReviewLocked ? 'Submitted' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSaveReview(true)}
              disabled={isSavingReview || isReviewLocked}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingReview ? 'Submitting…' : isReviewLocked ? 'Submitted' : 'Submit Review'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}