import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { hrService } from '@/services/hrService';
import type { User, UserRequest, Department, Role } from '@/types';
import { Modal } from '@/components/Modal';
import { RoleBadge } from '@/components/RoleBadge';
import { Icons } from '@/components/Icons';

const ROLE_OPTIONS: Role[] = ['HR', 'MANAGER', 'EMPLOYEE'];

const EMPTY_FORM: UserRequest = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  jobTitle: '',
  departmentId: '',
  managerId: '',
};

// Pulls a human-readable message out of an Axios error. Spring's default
// error body (and most custom @ExceptionHandler responses) is shaped like
// { message: "...", error: "...", status: 400 } — this checks the common
// field names backends use and falls back to a generic string only if none
// of them are present, instead of always discarding the real reason.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      const candidate = body.message ?? body.error ?? body.detail;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }
    if (typeof data === 'string' && data.trim()) {
      return data;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setIsLoading(true);
    Promise.all([hrService.getUsers(), hrService.getDepartments()])
      .then(([userList, departmentList]) => {
        setUsers(userList);
        setDepartments(departmentList);
      })
      .finally(() => setIsLoading(false));
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${u.name} ${u.email} ${u.jobTitle} ${u.department ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  const managerOptions = useMemo(
    () => users.filter((u) => u.id !== editingUserId),
    [users, editingUserId]
  );

  function openCreateModal() {
    setEditingUserId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function openEditModal(user: User) {
    setEditingUserId(user.id);
    setFormError(null);

    const defaults = await hrService.getUserFormDefaults(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      jobTitle: user.jobTitle,
      departmentId: defaults.departmentId,
      managerId: defaults.managerId ?? '',
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.email.trim() || !form.jobTitle.trim() || !form.departmentId) {
      setFormError('Name, email, job title, and department are required.');
      return;
    }
    if (!editingUserId && (!form.password || form.password.length < 6)) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: UserRequest = {
        ...form,
        managerId: form.managerId || null,
      };

      if (editingUserId) {
        await hrService.updateUser(editingUserId, payload);
      } else {
        await hrService.createUser(payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Something went wrong saving this user. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(user: User) {
    setActionError(null);
    try {
      await hrService.deactivateUser(user.id);
      loadData();
    } catch (err) {
      setActionError(
        extractErrorMessage(err, `Couldn't update ${user.name}'s status. Please try again.`)
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading users…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Users</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Manage all system users
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          <Icons.Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {actionError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {actionError}
        </p>
      )}

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgb(var(--border-subtle))] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, job title, department…"
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] py-2 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
            No users match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Job Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Manager</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[rgb(var(--text-primary))]">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{u.jobTitle}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {u.department ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {u.managerName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-surface-200 text-[rgb(var(--text-muted))] dark:bg-surface-800'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          aria-label={`Edit ${u.name}`}
                          className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
                        >
                          <Icons.Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          aria-label={u.status === 'ACTIVE' ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                          className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                          <Icons.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUserId ? 'Edit User' : 'Add User'}
        description={
          editingUserId
            ? 'Update this user\u2019s details below.'
            : 'Create a new user account in the system.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Full name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                {editingUserId ? 'New password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingUserId ? '••••••••' : 'At least 6 characters'}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Job title
              </label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Department
              </label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
                Manager (optional)
              </label>
              <select
                value={form.managerId ?? ''}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">No manager</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
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
              {isSaving ? 'Saving…' : editingUserId ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}