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

  async getDashboard(): Promise<ManagerDashboardData> {
    const { data } = await apiClient.get<ManagerDashboardData>('/manager/dashboard');
    return data;
  },

  async getTeam(): Promise<TeamMember[]> {
    const { data } = await apiClient.get<TeamMember[]>('/manager/team');
    return data;
  },

  async getCycles(): Promise<Cycle[]> {
    // Cycles are global — no managerId needed
    const { data } = await apiClient.get<Cycle[]>('/hr/cycles');
    return data;
  },

  async getGoals(): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/manager/goals');
    return data;
  },

  async getAssignableAppraisals(): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/manager/appraisals');
    return data;
  },

  // Manager reviewing a team member's appraisal after they've self-submitted.
  // submit=true moves status to MANAGER_REVIEWED; submit=false saves as
  // MANAGER_DRAFT so the manager can come back and finish later.
  async reviewTeamAppraisal(
    appraisalId: string,
    payload: ManagerReviewRequest,
    submit: boolean = true
  ): Promise<Appraisal> {
    const { data } = await apiClient.put<Appraisal>(
      `/manager/team-appraisals/${appraisalId}/review`,
      payload,
      { params: { submit } }
    );
    return data;
  },

  // Manager's own appraisals as an employee (someone else is their manager)
  async getMyAppraisals(): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/manager/my-appraisals');
    return data;
  },

  // Manager submitting their own self-assessment
  async submitSelfAssessment(
    appraisalId: string,
    payload: SelfAssessmentRequest
  ): Promise<Appraisal> {
    const { data } = await apiClient.post<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/self-assessment`,
      payload
    );
    return data;
  },

  // Manager saving their own self-assessment as draft
  async saveSelfAssessmentDraft(
    appraisalId: string,
    payload: SelfAssessmentRequest
  ): Promise<Appraisal> {
    const { data } = await apiClient.put<Appraisal>(
      `/manager/my-appraisals/${appraisalId}/draft`,
      payload
    );
    return data;
  },

  async createGoal(payload: GoalRequest): Promise<Goal> {
    const { data } = await apiClient.post<Goal>('/manager/goals', payload);
    return data;
  },

  async deleteGoal(goalId: string): Promise<void> {
    await apiClient.delete(`/manager/goals/${goalId}`);
  },

  // Manager confirms final goal status after employee has responded
  async confirmGoalStatus(goalId: string, completed: boolean): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/manager/goals/${goalId}/confirm`,
      { completed }
    );
    return data;
  },

  // Manager's own goals (assigned by their manager)
  async getMyGoals(): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/manager/my-goals');
    return data;
  },

  // Manager responding to their own goal as an employee
  async respondToGoal(
    goalId: string,
    payload: EmployeeGoalCompletionRequest
  ): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/manager/my-goals/${goalId}/respond`,
      payload
    );
    return data;
  },

  async getTeamReport(cycleId: string): Promise<TeamReport> {
    const { data } = await apiClient.get<TeamReport>('/manager/reports', {
      params: { cycleId },
    });
    return data;
  },
};