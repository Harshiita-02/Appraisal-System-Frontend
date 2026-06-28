import { useEffect, useState } from 'react';
import { employeeService } from '@/services/employeeService';
import type { Appraisal } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= Math.round(value) ? 'text-amber-400' : 'text-[rgb(var(--border-subtle))]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-[rgb(var(--text-primary))]">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ReviewCard({ appraisal }: { appraisal: Appraisal }) {
  const hasManagerReview = appraisal.managerRating != null || appraisal.managerComments;
  const hasSelfReview = appraisal.selfRating != null || appraisal.whatWentWell || appraisal.whatToImprove || appraisal.keyAchievements;

  return (
    <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgb(var(--border-subtle))] bg-brand-50/40 p-5 dark:bg-brand-900/10">
        <div>
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{appraisal.cycle}</h3>
          <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
            Manager: {appraisal.managerName}
            {appraisal.createdAt && <> · Started {formatDate(appraisal.createdAt)}</>}
          </p>
        </div>
        <StatusBadge status={appraisal.status} />
      </div>

      <div className="divide-y divide-[rgb(var(--border-subtle))]">

        {/* Manager Review Section */}
        <div className="p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
            Manager Review
          </h4>
          {!hasManagerReview ? (
            <p className="text-sm text-[rgb(var(--text-muted))] italic">
              Your manager hasn't submitted a review yet.
            </p>
          ) : (
            <div className="space-y-4">
              {appraisal.managerRating != null && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Rating</p>
                  <StarRating value={appraisal.managerRating} />
                </div>
              )}
              {appraisal.managerComments && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Comments</p>
                  <p className="rounded-lg bg-[rgb(var(--bg-subtle,var(--bg-card)))] border border-[rgb(var(--border-subtle))] px-3 py-2.5 text-sm text-[rgb(var(--text-primary))] leading-relaxed">
                    {appraisal.managerComments}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Self Assessment Section */}
        <div className="p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
            Your Self Assessment
          </h4>
          {!hasSelfReview ? (
            <p className="text-sm text-[rgb(var(--text-muted))] italic">
              You haven't submitted a self assessment yet.
            </p>
          ) : (
            <div className="space-y-4">
              {appraisal.selfRating != null && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Self Rating</p>
                  <StarRating value={appraisal.selfRating} />
                </div>
              )}
              {appraisal.keyAchievements && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">Key Achievements</p>
                  <p className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-2.5 text-sm text-[rgb(var(--text-primary))] leading-relaxed">
                    {appraisal.keyAchievements}
                  </p>
                </div>
              )}
              {appraisal.whatWentWell && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">What Went Well</p>
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 text-sm text-[rgb(var(--text-primary))] leading-relaxed dark:border-emerald-800 dark:bg-emerald-900/10">
                    {appraisal.whatWentWell}
                  </p>
                </div>
              )}
              {appraisal.whatToImprove && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[rgb(var(--text-secondary))]">What to Improve</p>
                  <p className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm text-[rgb(var(--text-primary))] leading-relaxed dark:border-amber-800 dark:bg-amber-900/10">
                    {appraisal.whatToImprove}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export function MyReviewsPage() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    employeeService
      .getMyAppraisals()
      .then(setAppraisals)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading reviews…
      </div>
    );
  }

  // Only show appraisals that have at least reached manager review stage
  const reviewable = appraisals.filter((a) =>
    ['MANAGER_DRAFT', 'MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'].includes(a.status)
  );

  // Show all appraisals but highlight ones with manager reviews
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Reviews</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Ratings and feedback from your manager
        </p>
      </div>

      {appraisals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No appraisals found.
        </div>
      ) : reviewable.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center">
          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">No manager reviews yet</p>
          <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
            Your manager's feedback will appear here once they complete your review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewable.map((a) => (
            <ReviewCard key={a.id} appraisal={a} />
          ))}
        </div>
      )}
    </div>
  );
}