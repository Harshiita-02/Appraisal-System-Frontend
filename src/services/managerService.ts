import { apiClient } from './apiClient';
import { mockUsers, mockAppraisals, mockGoals, mockCycles } from './mockData';
import type {
  Appraisal,
  Cycle,
  EmployeeGoalCompletionRequest,
  Goal,
  GoalRequest,
  ManagerDashboardData,
  SelfAssessmentRequest,
  TeamMember,
  TeamReport,
  User,
} from '@/types';

// Flip to false once the matching Spring Boot endpoints exist.
const USE_MOCK = true;
const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function nextId(existing: { id: string }[]): string {
  const max = existing.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(max + 1);
}

// In-memory mutable copies, mirroring the pattern in hrService.ts. Once
// USE_MOCK is false both services call the same real backend, so they
// naturally stay in sync there without needing a shared module here.
let usersStore: User[] = [...mockUsers];
let appraisalsStore: Appraisal[] = [...mockAppraisals];
let goalsStore: Goal[] = [...mockGoals];
const cyclesStore: Cycle[] = [...mockCycles];

// Manager relationship is read off User.managerName matched against the
// manager's own name, since the mock User type only stores managerName for
// display. The real backend returns managerId directly on each user, so
// this resolves itself once USE_MOCK is false and real DTOs are wired in.
function getManagerId(user: User): string | null {
  if (!user.managerName) return null;
  const manager = usersStore.find((u) => u.name === user.managerName);
  return manager?.id ?? null;
}

export const managerService = {
  async getDashboard(managerId: string): Promise<ManagerDashboardData> {
    if (USE_MOCK) {
      const teamSize = usersStore.filter((u) => getManagerId(u) === managerId).length;
      const teamAppraisals = appraisalsStore.filter((a) => a.managerId === managerId);
      const myAppraisals = appraisalsStore.filter((a) => a.employeeId === managerId);

      const awaitingMyReview = teamAppraisals.filter((a) => a.status === 'SELF_SUBMITTED').length;
      const completed = teamAppraisals.filter((a) => a.status === 'ACKNOWLEDGED').length;

      return delay({
        summary: {
          teamSize,
          activeReviews: teamAppraisals.length,
          awaitingMyReview,
          completed,
        },
        myAppraisals,
        teamAppraisals,
      });
    }

    // Expected real contract: GET /api/manager/dashboard -> ManagerDashboardData
    // (manager identified server-side from the auth token, no id param needed)
    const { data } = await apiClient.get<ManagerDashboardData>('/manager/dashboard');
    return data;
  },

  async getTeam(managerId: string): Promise<TeamMember[]> {
    if (USE_MOCK) {
      const team = usersStore
        .filter((u) => getManagerId(u) === managerId)
        .map((u) => ({
          id: u.id,
          name: u.name,
          jobTitle: u.jobTitle,
          department: u.department,
          email: u.email,
          status: u.status,
        }));
      return delay(team);
    }

    // Expected real contract: GET /api/manager/team -> TeamMember[]
    const { data } = await apiClient.get<TeamMember[]>('/manager/team');
    return data;
  },

  async getCycles(): Promise<Cycle[]> {
    if (USE_MOCK) return delay(cyclesStore);

    // Expected real contract: GET /api/manager/cycles -> Cycle[]
    const { data } = await apiClient.get<Cycle[]>('/manager/cycles');
    return data;
  },

  async getGoals(managerId: string): Promise<Goal[]> {
    if (USE_MOCK) {
      const teamAppraisalIds = new Set(
        appraisalsStore.filter((a) => a.managerId === managerId).map((a) => a.id)
      );
      return delay(goalsStore.filter((g) => teamAppraisalIds.has(g.appraisalId)));
    }

    // Expected real contract: GET /api/manager/goals -> Goal[]
    const { data } = await apiClient.get<Goal[]>('/manager/goals');
    return data;
  },

  // Appraisals a manager can attach a goal to — their team's appraisals,
  // labeled "EmployeeName — Cycle" to match the dropdown in the reference UI.
  async getAssignableAppraisals(managerId: string): Promise<Appraisal[]> {
    if (USE_MOCK) {
      return delay(appraisalsStore.filter((a) => a.managerId === managerId));
    }
    const { data } = await apiClient.get<Appraisal[]>('/manager/appraisals');
    return data;
  },

  // The manager's own appraisal cycles, as someone else's report (e.g.
  // Doremon reporting to Ripudaman Singh). Same data getDashboard() returns
  // under myAppraisals, exposed separately so the "My Appraisals" page
  // doesn't need to fetch the whole dashboard payload just for this list.
  async getMyAppraisals(employeeId: string): Promise<Appraisal[]> {
    if (USE_MOCK) {
      return delay(appraisalsStore.filter((a) => a.employeeId === employeeId));
    }

    // Expected real contract: GET /api/manager/my-appraisals -> Appraisal[]
    const { data } = await apiClient.get<Appraisal[]>('/manager/my-appraisals');
    return data;
  },

  // Submits (or re-submits, while still in an editable stage) a self
  // assessment. Moves PENDING/EMPLOYEE_DRAFT -> SELF_SUBMITTED. If the
  // appraisal is already past that stage, this is a no-op rejection rather
  // than silently overwriting a manager's in-progress review.
  async submitSelfAssessment(appraisalId: string, payload: SelfAssessmentRequest): Promise<Appraisal> {
    if (USE_MOCK) {
      const current = appraisalsStore.find((a) => a.id === appraisalId);
      if (!current) throw new Error('Appraisal not found');

      const editableStatuses: Appraisal['status'][] = ['PENDING', 'EMPLOYEE_DRAFT'];
      if (!editableStatuses.includes(current.status)) {
        throw new Error('This appraisal has already moved past the self-assessment stage.');
      }

      let updated: Appraisal | undefined;
      appraisalsStore = appraisalsStore.map((a) => {
        if (a.id !== appraisalId) return a;
        updated = {
          ...a,
          status: 'SELF_SUBMITTED',
          selfRating: payload.selfRating,
          rating: payload.selfRating,
          whatWentWell: payload.whatWentWell,
          whatToImprove: payload.whatToImprove,
          keyAchievements: payload.keyAchievements,
        };
        return updated;
      });

      if (!updated) throw new Error('Appraisal not found');
      return delay(updated);
    }

    // Expected real contract: POST /api/manager/my-appraisals/{id}/self-assessment
    const { data } = await apiClient.post<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/self-assessment`,
      payload
    );
    return data;
  },

  // Saves a self-assessment as a draft without submitting (status stays
  // EMPLOYEE_DRAFT). Lets someone fill in partial answers and come back.
  async saveSelfAssessmentDraft(appraisalId: string, payload: SelfAssessmentRequest): Promise<Appraisal> {
    if (USE_MOCK) {
      let updated: Appraisal | undefined;
      appraisalsStore = appraisalsStore.map((a) => {
        if (a.id !== appraisalId) return a;
        updated = {
          ...a,
          status: 'EMPLOYEE_DRAFT',
          selfRating: payload.selfRating,
          rating: payload.selfRating,
          whatWentWell: payload.whatWentWell,
          whatToImprove: payload.whatToImprove,
          keyAchievements: payload.keyAchievements,
        };
        return updated;
      });
      if (!updated) throw new Error('Appraisal not found');
      return delay(updated);
    }

    // Expected real contract: PUT /api/manager/my-appraisals/{id}/draft
    const { data } = await apiClient.put<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/draft`,
      payload
    );
    return data;
  },

  async createGoal(payload: GoalRequest): Promise<Goal> {
    if (USE_MOCK) {
      const appraisal = appraisalsStore.find((a) => a.id === payload.appraisalId);
      if (!appraisal) throw new Error('Appraisal not found');

      const newGoal: Goal = {
        id: nextId(goalsStore),
        appraisalId: appraisal.id,
        employeeId: appraisal.employeeId,
        employeeName: appraisal.employeeName,
        cycle: appraisal.cycle,
        title: payload.title,
        description: payload.description ?? null,
        dueDate: payload.dueDate,
        status: 'NOT_STARTED',
        employeeResponse: 'PENDING',
      };
      goalsStore = [...goalsStore, newGoal];
      return delay(newGoal);
    }

    // Expected real contract: POST /api/manager/goals { ...GoalRequest } -> Goal
    const { data } = await apiClient.post<Goal>('/manager/goals', payload);
    return data;
  },

  async deleteGoal(goalId: string): Promise<void> {
    if (USE_MOCK) {
      goalsStore = goalsStore.filter((g) => g.id !== goalId);
      return delay(undefined);
    }

    // Expected real contract: DELETE /api/manager/goals/{id}
    await apiClient.delete(`/manager/goals/${goalId}`);
  },

  // Manager's final say on a goal after the employee has responded
  // ("Confirm the final status" in the reference UI's review modal).
  async confirmGoalStatus(goalId: string, completed: boolean): Promise<Goal> {
    if (USE_MOCK) {
      let updated: Goal | undefined;
      goalsStore = goalsStore.map((g) => {
        if (g.id !== goalId) return g;
        updated = { ...g, status: completed ? 'COMPLETED' : 'NOT_STARTED' };
        return updated;
      });
      if (!updated) throw new Error('Goal not found');
      return delay(updated);
    }

    // Expected real contract: PATCH /api/manager/goals/{id}/confirm { completed }
    const { data } = await apiClient.patch<Goal>(`/manager/goals/${goalId}/confirm`, { completed });
    return data;
  },

  // Goals assigned to the manager by their own manager (mirrors My Appraisals
  // — the manager viewed as someone else's report).
  async getMyGoals(employeeId: string): Promise<Goal[]> {
    if (USE_MOCK) {
      return delay(goalsStore.filter((g) => g.employeeId === employeeId));
    }

    // Expected real contract: GET /api/manager/my-goals -> Goal[]
    const { data } = await apiClient.get<Goal[]>('/manager/my-goals');
    return data;
  },

  // Employee-side response to a goal ("Did you complete this goal?" — Yes,
  // completed / No, not done — with an optional note). Distinct from
  // confirmGoalStatus, which is the manager's final word after this.
  async respondToGoal(goalId: string, payload: EmployeeGoalCompletionRequest): Promise<Goal> {
    if (USE_MOCK) {
      let updated: Goal | undefined;
      goalsStore = goalsStore.map((g) => {
        if (g.id !== goalId) return g;
        updated = {
          ...g,
          employeeResponse: payload.completed ? 'COMPLETED' : 'NOT_COMPLETED',
          employeeNote: payload.note ?? null,
        };
        return updated;
      });
      if (!updated) throw new Error('Goal not found');
      return delay(updated);
    }

    // Expected real contract: PATCH /api/manager/my-goals/{id}/respond
    const { data } = await apiClient.patch<Goal>(`/manager/my-goals/${goalId}/respond`, payload);
    return data;
  },

  async getTeamReport(managerId: string, cycleId: string): Promise<TeamReport> {
    if (USE_MOCK) {
      const cycle = cyclesStore.find((c) => c.id === cycleId);
      const cycleName = cycle?.name ?? cycleId;
      const team = usersStore.filter((u) => getManagerId(u) === managerId);

      const rows = team.map((member) => {
        const appraisal = appraisalsStore.find(
          (a) => a.employeeId === member.id && a.cycleId === cycleId
        );
        const memberGoals = goalsStore.filter(
          (g) => g.employeeId === member.id && g.cycle === cycleName
        );

        return {
          employeeId: member.id,
          employeeName: member.name,
          jobTitle: member.jobTitle,
          status: appraisal?.status ?? ('PENDING' as const),
          selfRating: appraisal?.selfRating ?? null,
          managerRating: appraisal?.managerRating ?? null,
          goalsCompleted: memberGoals.filter((g) => g.status === 'COMPLETED').length,
          goalsTotal: memberGoals.length,
        };
      });

      const ratedRows = rows.filter(
        (r): r is typeof r & { selfRating: number } => typeof r.selfRating === 'number'
      );
      const avgRating =
        ratedRows.length > 0
          ? Math.round(
              (ratedRows.reduce((sum, r) => sum + r.selfRating, 0) / ratedRows.length) * 10
            ) / 10
          : null;

      return delay({
        cycle: cycleName,
        teamMembers: team.length,
        avgRating,
        rows,
      });
    }

    // Expected real contract: GET /api/manager/reports?cycleId=1 -> TeamReport
    const { data } = await apiClient.get<TeamReport>('/manager/reports', {
      params: { cycleId },
    });
    return data;
  },
};