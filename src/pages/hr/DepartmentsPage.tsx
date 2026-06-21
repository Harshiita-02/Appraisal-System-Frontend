import { useEffect, useState, type FormEvent } from 'react';
import { hrService } from '@/services/hrService';
import type { Department, DepartmentRequest } from '@/types';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

const EMPTY_FORM: DepartmentRequest = { name: '', description: '' };

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setIsLoading(true);
    hrService
      .getDepartments()
      .then(setDepartments)
      .finally(() => setIsLoading(false));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(dept: Department) {
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description ?? '' });
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await hrService.updateDepartment(editingId, form);
      } else {
        await hrService.createDepartment(form);
      }
      closeModal();
      loadData();
    } catch {
      setFormError('Something went wrong saving this department. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);

    if (deleteTarget.employeeCount > 0) {
      setDeleteError(
        `Can't delete ${deleteTarget.name} — it still has ${deleteTarget.employeeCount} employee${
          deleteTarget.employeeCount === 1 ? '' : 's'
        } assigned. Reassign them first.`
      );
      return;
    }

    await hrService.deleteDepartment(deleteTarget.id);
    setDeleteTarget(null);
    loadData();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading departments…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Departments</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Manage organization departments
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          <Icons.Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No departments yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <Icons.Department className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(dept)}
                    aria-label={`Edit ${dept.name}`}
                    className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(dept);
                      setDeleteError(null);
                    }}
                    aria-label={`Delete ${dept.name}`}
                    className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="mt-3 text-base font-semibold text-[rgb(var(--text-primary))]">
                {dept.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-[rgb(var(--text-secondary))]">
                {dept.description || 'No description provided.'}
              </p>

              <div className="mt-4 flex items-center gap-1.5 border-t border-[rgb(var(--border-subtle))] pt-3 text-sm text-[rgb(var(--text-secondary))]">
                <Icons.Users className="h-4 w-4 text-brand-500" />
                <span className="font-medium text-[rgb(var(--text-primary))]">
                  {dept.employeeCount}
                </span>
                {dept.employeeCount === 1 ? 'employee' : 'employees'}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Department' : 'Add Department'}
        description={
          editingId
            ? 'Update this department\u2019s details below.'
            : 'Create a new department for your organization.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Department name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Java Team"
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="What does this team work on?"
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Create department'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete department?"
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.name}". This can't be undone.`
            : undefined
        }
      >
        {deleteError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {deleteError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}