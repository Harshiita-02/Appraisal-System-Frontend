import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import type { TeamMember } from '@/types';
import { Icons } from '@/components/Icons';

export function MyTeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    managerService
      .getTeam()
      .then(setTeam)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading your team…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Team</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {team.length} direct report{team.length === 1 ? '' : 's'}
        </p>
      </div>

      {team.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No direct reports yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {member.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[rgb(var(--text-primary))]">
                      {member.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}
                    >
                      {member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[rgb(var(--text-secondary))]">
                <div className="flex items-center gap-2">
                  <Icons.UserCircle className="h-4 w-4 text-brand-500" />
                  {member.jobTitle}
                </div>
                {member.department && (
                  <div className="flex items-center gap-2">
                    <Icons.Department className="h-4 w-4 text-brand-500" />
                    {member.department}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icons.Mail className="h-4 w-4 text-brand-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}