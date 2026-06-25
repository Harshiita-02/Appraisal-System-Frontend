import { apiClient } from './apiClient';
import type {
  Appraisal,
  Cycle,
  EmployeeGoalCompletionRequest,
  Goal,
  GoalRequest,
  ManagerDashboardData,
  SelfAssessmentRequest,
  ManagerReviewRequest,
  TeamMember,
  TeamReport,
} from '@/types';

export const managerService = {

  async getDashboard(managerId: string): Promise<ManagerDashboardData> {
    const { data } = await apiClient.get<ManagerDashboardData>('/manager/dashboard', {
      params: { managerId },
    });
    return data;
  },

  async getTeam(managerId: string): Promise<TeamMember[]> {
    const { data } = await apiClient.get<TeamMember[]>('/manager/team', {
      params: { managerId },
    });
    return data;
  },

  async getCycles(): Promise<Cycle[]> {
    // Cycles are global — no managerId needed
    const { data } = await apiClient.get<Cycle[]>('/hr/cycles');
    return data;
  },

  async getGoals(managerId: string): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/manager/goals', {
      params: { managerId },
    });
    return data;
  },

  async getAssignableAppraisals(managerId: string): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/manager/appraisals', {
      params: { managerId },
    });
    return data;
  },

  // Manager reviewing a team member's appraisal after they've self-submitted.
// submit=true moves status to MANAGER_REVIEWED; submit=false saves as
// MANAGER_DRAFT so the manager can come back and finish later.
async reviewTeamAppraisal(
  appraisalId: string,
  payload: ManagerReviewRequest,
  managerId: string,
  submit: boolean = true
): Promise<Appraisal> {
  const { data } = await apiClient.put<Appraisal>(
    `/manager/team-appraisals/${appraisalId}/review`,
    payload,
    { params: { managerId, submit } }
  );
  return data;
},

  // Manager's own appraisals as an employee (someone else is their manager)
  async getMyAppraisals(managerId: string): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/manager/my-appraisals', {
      params: { managerId },
    });
    return data;
  },

  // Manager submitting their own self-assessment
  async submitSelfAssessment(
    appraisalId: string,
    payload: SelfAssessmentRequest,
    managerId: string
  ): Promise<Appraisal> {
    const { data } = await apiClient.post<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/self-assessment`,
      payload,
      { params: { managerId } }
    );
    return data;
  },

  // Manager saving their own self-assessment as draft
  async saveSelfAssessmentDraft(
    appraisalId: string,
    payload: SelfAssessmentRequest,
    managerId: string
  ): Promise<Appraisal> {
    const { data } = await apiClient.put<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/draft`,
      payload,
      { params: { managerId } }
    );
    return data;
  },

  async createGoal(payload: GoalRequest, managerId: string): Promise<Goal> {
    const { data } = await apiClient.post<Goal>('/manager/goals', payload, {
      params: { managerId },
    });
    return data;
  },

  async deleteGoal(goalId: string, managerId: string): Promise<void> {
    await apiClient.delete(`/manager/goals/${goalId}`, {
      params: { managerId },
    });
  },

  // Manager confirms final goal status after employee has responded
  async confirmGoalStatus(goalId: string, completed: boolean, managerId: string): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/manager/goals/${goalId}/confirm`,
      { completed },
      { params: { managerId } }
    );
    return data;
  },

  // Manager's own goals (assigned by their manager)
  async getMyGoals(managerId: string): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/manager/my-goals', {
      params: { managerId },
    });
    return data;
  },

  // Manager responding to their own goal as an employee
  async respondToGoal(
    goalId: string,
    payload: EmployeeGoalCompletionRequest,
    managerId: string
  ): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/manager/my-goals/${goalId}/respond`,
      payload,
      { params: { managerId } }
    );
    return data;
  },

  async getTeamReport(managerId: string, cycleId: string): Promise<TeamReport> {
    const { data } = await apiClient.get<TeamReport>('/manager/reports', {
      params: { managerId, cycleId },
    });
    return data;
  },
};