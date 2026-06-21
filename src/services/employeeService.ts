import { apiClient } from './apiClient';
import { mockAppraisals, mockGoals } from './mockData';
import type {
  Appraisal,
  EmployeeGoalCompletionRequest,
  Goal,
  SelfAssessmentRequest,
} from '@/types';

// Flip to false once the matching Spring Boot endpoints exist.
const USE_MOCK = true;
const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

// In-memory mutable copies, mirroring the pattern in hrService.ts and
// managerService.ts. Once USE_MOCK is false all three services call the
// same real backend, so they naturally stay in sync there.
let appraisalsStore: Appraisal[] = [...mockAppraisals];
let goalsStore: Goal[] = [...mockGoals];

export const employeeService = {
  // Dashboard summary: active appraisals, goals in progress, unread
  // notifications. Notifications aren't modeled yet — kept at a small fixed
  // count for now matching the reference screenshot rather than a fake
  // notification feed nobody asked for.
  async getDashboard(employeeId: string) {
    if (USE_MOCK) {
      const myAppraisals = appraisalsStore.filter((a) => a.employeeId === employeeId);
      const myGoals = goalsStore.filter((g) => g.employeeId === employeeId);

      const activeAppraisals = myAppraisals.filter((a) => a.status !== 'ACKNOWLEDGED').length;
      const goalsInProgress = myGoals.filter((g) => g.status !== 'COMPLETED').length;

      return delay({
        activeAppraisals,
        goalsInProgress,
        unreadNotifications: 1,
        appraisals: myAppraisals,
      });
    }

    // Expected real contract: GET /api/employee/dashboard -> EmployeeDashboardData
    const { data } = await apiClient.get('/employee/dashboard');
    return data;
  },

  async getMyAppraisals(employeeId: string): Promise<Appraisal[]> {
    if (USE_MOCK) {
      return delay(appraisalsStore.filter((a) => a.employeeId === employeeId));
    }

    // Expected real contract: GET /api/employee/appraisals -> Appraisal[]
    const { data } = await apiClient.get<Appraisal[]>('/employee/appraisals');
    return data;
  },

  async getAppraisalById(appraisalId: string): Promise<Appraisal> {
    if (USE_MOCK) {
      const appraisal = appraisalsStore.find((a) => a.id === appraisalId);
      if (!appraisal) throw new Error('Appraisal not found');
      return delay(appraisal);
    }

    // Expected real contract: GET /api/employee/appraisals/{id} -> Appraisal
    const { data } = await apiClient.get<Appraisal>(`/employee/appraisals/${appraisalId}`);
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

    // Expected real contract: PUT /api/employee/appraisals/{id}/draft
    const { data } = await apiClient.put<Appraisal>(
      `/employee/appraisals/${appraisalId}/draft`,
      payload
    );
    return data;
  },

  // Submits the self-assessment. Moves PENDING/EMPLOYEE_DRAFT ->
  // SELF_SUBMITTED, which locks the form (matches "Submit only when ready
  // — it locks" from the reference UI's guide page).
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

    // Expected real contract: POST /api/employee/appraisals/{id}/self-assessment
    const { data } = await apiClient.post<Appraisal>(
      `/employee/appraisals/${appraisalId}/self-assessment`,
      payload
    );
    return data;
  },

  // Employee acknowledgement of a fully-approved appraisal (the final
  // stage in the workflow: APPROVED -> ACKNOWLEDGED).
  async acknowledgeAppraisal(appraisalId: string): Promise<Appraisal> {
    if (USE_MOCK) {
      const current = appraisalsStore.find((a) => a.id === appraisalId);
      if (!current) throw new Error('Appraisal not found');
      if (current.status !== 'APPROVED') {
        throw new Error('This appraisal is not ready to be acknowledged yet.');
      }

      let updated: Appraisal | undefined;
      appraisalsStore = appraisalsStore.map((a) => {
        if (a.id !== appraisalId) return a;
        updated = { ...a, status: 'ACKNOWLEDGED' };
        return updated;
      });
      if (!updated) throw new Error('Appraisal not found');
      return delay(updated);
    }

    // Expected real contract: PATCH /api/employee/appraisals/{id}/acknowledge
    const { data } = await apiClient.patch<Appraisal>(
      `/employee/appraisals/${appraisalId}/acknowledge`
    );
    return data;
  },

  async getMyGoals(employeeId: string): Promise<Goal[]> {
    if (USE_MOCK) {
      return delay(goalsStore.filter((g) => g.employeeId === employeeId));
    }

    // Expected real contract: GET /api/employee/goals -> Goal[]
    const { data } = await apiClient.get<Goal[]>('/employee/goals');
    return data;
  },

  // "Did you complete this goal?" response — Yes/No plus an optional note.
  // The manager has the final say afterward via their own confirm step.
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

    // Expected real contract: PATCH /api/employee/goals/{id}/respond
    const { data } = await apiClient.patch<Goal>(`/employee/goals/${goalId}/respond`, payload);
    return data;
  },
};