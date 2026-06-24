import { apiClient } from './apiClient';
import type {
  Appraisal,
  EmployeeDashboardData,
  EmployeeGoalCompletionRequest,
  Goal,
  SelfAssessmentRequest,
} from '@/types';

// ✅ Mock is OFF — all calls go to the real Spring Boot backend
const USE_MOCK = false;

export const employeeService = {

  async getDashboard(employeeId: string): Promise<EmployeeDashboardData> {
    const { data } = await apiClient.get<EmployeeDashboardData>('/employee/dashboard', {
      params: { employeeId },
    });
    return data;
  },

  async getMyAppraisals(employeeId: string): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/employee/appraisals', {
      params: { employeeId },
    });
    return data;
  },

  async getAppraisalById(appraisalId: string, employeeId: string): Promise<Appraisal> {
    const { data } = await apiClient.get<Appraisal>(`/employee/appraisals/${appraisalId}`, {
      params: { employeeId },
    });
    return data;
  },

  // Saves draft without submitting — status stays EMPLOYEE_DRAFT
  async saveSelfAssessmentDraft(
    appraisalId: string,
    payload: SelfAssessmentRequest,
    employeeId: string
  ): Promise<Appraisal> {
    const { data } = await apiClient.put<Appraisal>(
      `/employee/appraisals/${appraisalId}/draft`,
      payload,
      { params: { employeeId } }
    );
    return data;
  },

  // Submits self-assessment — moves status to SELF_SUBMITTED (locks the form)
  async submitSelfAssessment(
    appraisalId: string,
    payload: SelfAssessmentRequest,
    employeeId: string
  ): Promise<Appraisal> {
    const { data } = await apiClient.post<Appraisal>(
      `/employee/appraisals/${appraisalId}/self-assessment`,
      payload,
      { params: { employeeId } }
    );
    return data;
  },

  // Final step: employee acknowledges an APPROVED appraisal -> ACKNOWLEDGED
  async acknowledgeAppraisal(appraisalId: string, employeeId: string): Promise<Appraisal> {
    const { data } = await apiClient.patch<Appraisal>(
      `/employee/appraisals/${appraisalId}/acknowledge`,
      null,
      { params: { employeeId } }
    );
    return data;
  },

  async getMyGoals(employeeId: string): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/employee/goals', {
      params: { employeeId },
    });
    return data;
  },

  async respondToGoal(
    goalId: string,
    payload: EmployeeGoalCompletionRequest,
    employeeId: string
  ): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/employee/goals/${goalId}/respond`,
      payload,
      { params: { employeeId } }
    );
    return data;
  },
};