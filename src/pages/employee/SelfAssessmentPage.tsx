import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import type { Appraisal } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Icons } from '@/components/Icons';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SelfAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [keyAchievements, setKeyAchievements] = useState('');
  const [selfRating, setSelfRating] = useState(0);

  const [formError, setFormError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    employeeService
      .getAppraisalById(id)
      .then((a) => {
        setAppraisal(a);
        setWhatWentWell(a.whatWentWell ?? '');
        setWhatToImprove(a.whatToImprove ?? '');
        setKeyAchievements(a.keyAchievements ?? '');
        setSelfRating(a.selfRating ?? 0);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const isEditable = appraisal?.status === 'PENDING' || appraisal?.status === 'EMPLOYEE_DRAFT';

  async function handleSaveDraft() {
    if (!appraisal) return;
    setFormError(null);
    setIsSavingDraft(true);
    try {
      const updated = await employeeService.saveSelfAssessmentDraft(appraisal.id, {
        whatWentWell,
        whatToImprove,
        keyAchievements,
        selfRating: selfRating || 1,
      });
      setAppraisal(updated);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      setFormError('Could not save your draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmit() {
    if (!appraisal) return;
    setFormError(null);

    if (!whatWentWell.trim() || !whatToImprove.trim() || !keyAchievements.trim()) {
      setFormError('Please fill in all required fields before submitting.');
      return;
    }
    if (selfRating < 1) {
      setFormError('Click a star to rate yourself before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeeService.submitSelfAssessment(appraisal.id, {
        whatWentWell,
        whatToImprove,
        keyAchievements,
        selfRating,
      });
      navigate('/employee/appraisals');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading…
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Appraisal not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/employee/appraisals"
          aria-label="Back to My Appraisals"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
        >
          <Icons.ChevronDown className="h-4 w-4 rotate-90" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Self Assessment</h1>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            {appraisal.cycle} · Manager: {appraisal.managerName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card sm:grid-cols-3">
        <div>
          <p className="text-xs text-[rgb(var(--text-muted))]">Cycle</p>
          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{appraisal.cycle}</p>
        </div>
        <div>
          <p className="text-xs text-[rgb(var(--text-muted))]">Period</p>
          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
            {appraisal.startDate && appraisal.endDate
              ? `${formatDate(appraisal.startDate)} — ${formatDate(appraisal.endDate)}`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[rgb(var(--text-muted))]">Status</p>
          <div className="mt-0.5">
            <StatusBadge status={appraisal.status} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
            Fill Your Self Assessment
          </h2>
          {!isEditable && (
            <span className="text-xs text-[rgb(var(--text-muted))]">
              Locked — already submitted
            </span>
          )}
        </div>

        <div className="mt-4 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              What Went Well {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="Describe your key contributions and successes..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              What Could I Improve {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="Be honest about areas where you could have done better..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Key Achievements {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={keyAchievements}
              onChange={(e) => setKeyAchievements(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="List specific achievements, metrics, projects completed..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Self Rating {isEditable && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => setSelfRating(value)}
                  aria-label={`Rate ${value} out of 5`}
                  className="disabled:cursor-not-allowed"
                >
                  <Icons.Star
                    filled={value <= selfRating}
                    className={`h-7 w-7 ${
                      value <= selfRating
                        ? 'text-amber-400'
                        : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            {isEditable && (
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Click a star to rate yourself</p>
            )}
          </div>

          {appraisal.managerRating != null && (
            <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-900/20">
              <span className="font-medium text-brand-700 dark:text-brand-300">Manager rating: </span>
              <StarRating value={appraisal.managerRating} />
            </div>
          )}

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          {draftSaved && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Icons.Check className="h-4 w-4" />
              Draft saved
            </p>
          )}

          {isEditable && (
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                className="flex items-center justify-center gap-2 rounded-lg border border-brand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-surface-800"
              >
                <Icons.Edit className="h-4 w-4" />
                {isSavingDraft ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSavingDraft || isSubmitting}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting…' : 'Submit to Manager'}
              </button>
            </div>
          )}

          {isEditable && (
            <p className="text-xs text-[rgb(var(--text-muted))]">
              Save Draft keeps your progress editable. Submit sends it to your manager and locks
              the form.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}