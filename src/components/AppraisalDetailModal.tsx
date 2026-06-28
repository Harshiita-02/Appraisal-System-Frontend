import type { Appraisal } from '@/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Read-only view of one appraisal's full content for HR — the
 * employee's self-assessment AND the manager's rating/comments,
 * side by side. HR never edits here, just reviews before
 * approving/acknowledging via the Advance button on the page itself.
 */
export function AppraisalDetailsModal({
  appraisal,
  onClose,
}: {
  appraisal: Appraisal | null;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={!!appraisal}
      onClose={onClose}
      title="Appraisal Details"
      description={appraisal ? `${appraisal.employeeName} — ${appraisal.cycle}` : undefined}
    >
      {appraisal && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-[rgb(var(--border-subtle))] p-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">Manager</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{appraisal.managerName}</p>
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">Department</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{appraisal.department}</p>
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">Status</p>
              <StatusBadge status={appraisal.status} />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">Created</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{formatDate(appraisal.createdAt)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Employee Self-Assessment
            </h3>
            {appraisal.selfRating == null && !appraisal.whatWentWell ? (
              <p className="text-sm italic text-[rgb(var(--text-muted))]">
                Employee hasn't submitted a self-assessment yet.
              </p>
            ) : (
              <div className="space-y-3">
                {appraisal.selfRating != null && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">Self Rating</p>
                    <StarRating value={appraisal.selfRating} />
                  </div>
                )}
                {appraisal.whatWentWell && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">What Went Well</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{appraisal.whatWentWell}</p>
                  </div>
                )}
                {appraisal.whatToImprove && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">What To Improve</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{appraisal.whatToImprove}</p>
                  </div>
                )}
                {appraisal.keyAchievements && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">Key Achievements</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{appraisal.keyAchievements}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[rgb(var(--border-subtle))] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Manager Review
            </h3>
            {appraisal.managerRating == null && !appraisal.managerComments ? (
              <p className="text-sm italic text-[rgb(var(--text-muted))]">
                Manager hasn't submitted a review yet.
              </p>
            ) : (
              <div className="space-y-3">
                {appraisal.managerRating != null && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">Manager Rating</p>
                    <StarRating value={appraisal.managerRating} />
                  </div>
                )}
                {appraisal.managerComments && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-[rgb(var(--text-secondary))]">Comments</p>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{appraisal.managerComments}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}