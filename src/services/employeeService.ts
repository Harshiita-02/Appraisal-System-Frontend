import { apiClient } from './apiClient';
import type {
  Appraisal,
  EmployeeDashboardData,
  EmployeeGoalCompletionRequest,
  Goal,
  SelfAssessmentRequest,
} from '@/types';

export const employeeService = {

  async getDashboard(): Promise<EmployeeDashboardData> {
    const { data } = await apiClient.get<EmployeeDashboardData>('/employee/dashboard');
    return data;
  },

  async getMyAppraisals(): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/employee/appraisals');
    return data;
  },

  async getAppraisalById(appraisalId: string): Promise<Appraisal> {
    const { data } = await apiClient.get<Appraisal>(`/employee/appraisals/${appraisalId}`);
    return data;
  },

  // Saves draft without submitting — status stays EMPLOYEE_DRAFT
  async saveSelfAssessmentDraft(
    appraisalId: string,
    payload: SelfAssessmentRequest
  ): Promise<Appraisal> {
    const { data } = await apiClient.put<Appraisal>(
      `/employee/appraisals/${appraisalId}/draft`,
      payload
    );
    return data;
  },

  // Submits self-assessment — moves status to SELF_SUBMITTED (locks the form)
  async submitSelfAssessment(
    appraisalId: string,
    payload: SelfAssessmentRequest
  ): Promise<Appraisal> {
    const { data } = await apiClient.post<Appraisal>(
      `/employee/appraisals/${appraisalId}/self-assessment`,
      payload
    );
    return data;
  },

  // Final step: employee acknowledges an APPROVED appraisal -> ACKNOWLEDGED
  async acknowledgeAppraisal(appraisalId: string): Promise<Appraisal> {
    const { data } = await apiClient.patch<Appraisal>(
      `/employee/appraisals/${appraisalId}/acknowledge`,
      null
    );
    return data;
  },

  async getMyGoals(): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/employee/goals');
    return data;
  },

  async respondToGoal(
    goalId: string,
    payload: EmployeeGoalCompletionRequest
  ): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/employee/goals/${goalId}/respond`,
      payload
    );
    return data;
  },
};