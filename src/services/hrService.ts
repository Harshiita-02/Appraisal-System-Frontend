import { apiClient } from './apiClient';
import type {
  DashboardData,
  User,
  UserRequest,
  Department,
  DepartmentRequest,
  Appraisal,
  Cycle,
  CreateAppraisalRequest,
  AppraisalStatus,
  CycleReport,
  EmployeeGoalCompletionRequest,
  Goal,
  GoalRequest,
} from '@/types';
import { APPRAISAL_STATUS_ORDER } from '@/types';

export const hrService = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardData>('/hr/dashboard');
    return data;
  },

  // ---- Users ------------------------------------------------------------

  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/hr/users');
    return data;
  },

  async getUserFormDefaults(userId: string): Promise<{ departmentId: string; managerId: string | null }> {
    const { data } = await apiClient.get(`/hr/users/${userId}`);
    return data;
  },

  async createUser(payload: UserRequest): Promise<User> {
    const { data } = await apiClient.post<User>('/hr/users', payload);
    return data;
  },

  async updateUser(userId: string, payload: UserRequest): Promise<User> {
    const { data } = await apiClient.put<User>(`/hr/users/${userId}`, payload);
    return data;
  },

  async deactivateUser(userId: string): Promise<void> {
    await apiClient.patch(`/hr/users/${userId}/status`, null, {
      params: { status: 'INACTIVE' },
    });
  },

  // ---- Departments --------------------------------------------------------

  async getDepartments(): Promise<Department[]> {
    const { data } = await apiClient.get<Department[]>('/hr/departments');
    return data;
  },

  async createDepartment(payload: DepartmentRequest): Promise<Department> {
    const { data } = await apiClient.post<Department>('/hr/departments', payload);
    return data;
  },

  async updateDepartment(departmentId: string, payload: DepartmentRequest): Promise<Department> {
    const { data } = await apiClient.put<Department>(`/hr/departments/${departmentId}`, payload);
    return data;
  },

  async deleteDepartment(departmentId: string): Promise<void> {
    await apiClient.delete(`/hr/departments/${departmentId}`);
  },

  // ---- Cycles -------------------------------------------------------------

  async getCycles(): Promise<Cycle[]> {
    const { data } = await apiClient.get<Cycle[]>('/hr/cycles');
    return data;
  },

  async createCycle(payload: { name: string; startDate: string; endDate: string }): Promise<Cycle> {
    const { data } = await apiClient.post<Cycle>('/hr/cycles', payload);
    return data;
  },

  // ---- Appraisals ---------------------------------------------------------

  async getAppraisals(): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/hr/appraisals');
    return data;
  },

  async createAppraisals(payload: CreateAppraisalRequest): Promise<Appraisal[]> {
    if (payload.mode === 'single') {
      const { data } = await apiClient.post<Appraisal>('/hr/appraisals', payload);
      return [data];
    }
    if (payload.mode === 'department') {
      const { data } = await apiClient.post<Appraisal[]>('/hr/appraisals/bulk/department', payload);
      return data;
    }
    const { data } = await apiClient.post<Appraisal[]>('/hr/appraisals/bulk/all', payload);
    return data;
  },

  async advanceAppraisalStatus(appraisalId: string, currentStatus: AppraisalStatus): Promise<Appraisal> {
    const currentIndex = APPRAISAL_STATUS_ORDER.indexOf(currentStatus);
    const nextStatus: AppraisalStatus | undefined = APPRAISAL_STATUS_ORDER[currentIndex + 1];
    const { data } = await apiClient.patch<Appraisal>(
      `/hr/appraisals/${appraisalId}/status`,
      null,
      { params: { status: nextStatus } }
    );
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/hr/users/${userId}`);
},

  async getCycleReport(cycleId: string): Promise<CycleReport> {
    const { data } = await apiClient.get<CycleReport>('/hr/reports', {
      params: { cycleId },
    });
    return data;
  },

  // ---- Goals -------------------------------------------------------------

  async getGoals(): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/hr/goals');
    return data;
  },

  async getAssignableAppraisals(): Promise<Appraisal[]> {
    const { data } = await apiClient.get<Appraisal[]>('/hr/appraisals/assignable');
    return data;
  },

  async createGoal(payload: GoalRequest, hrId: string): Promise<Goal> {
    const { data } = await apiClient.post<Goal>('/hr/goals', payload, {
      params: { hrId },
    });
    return data;
  },

  async deleteGoal(goalId: string, hrId: string): Promise<void> {
    await apiClient.delete(`/hr/goals/${goalId}`, {
      params: { hrId },
    });
  },

  async confirmGoalStatus(goalId: string, completed: boolean, hrId: string): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/hr/goals/${goalId}/confirm`,
      { completed },
      { params: { hrId } }
    );
    return data;
  },

  async respondToGoal(
    goalId: string,
    payload: EmployeeGoalCompletionRequest,
    hrId: string
  ): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(
      `/hr/goals/${goalId}/respond`,
      payload,
      { params: { hrId } }
    );
    return data;
  },
};