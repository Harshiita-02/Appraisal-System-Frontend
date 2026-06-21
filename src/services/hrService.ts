import { apiClient } from './apiClient';
import {
  mockUsers,
  mockDepartments,
  mockUserDepartmentIds,
  mockUserManagerIds,
  mockCycles,
  mockAppraisals,
} from './mockData';
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
} from '@/types';
import { APPRAISAL_STATUS_ORDER } from '@/types';

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

// In-memory mutable copies so create/edit/delete persist for the session
// without a backend. Replaced entirely once USE_MOCK is false.
let usersStore: User[] = [...mockUsers];
let departmentsStore: Department[] = [...mockDepartments];
let appraisalsStore: Appraisal[] = [...mockAppraisals];
const cyclesStore: Cycle[] = [...mockCycles];
const userDepartmentIds: Record<string, string> = { ...mockUserDepartmentIds };
const userManagerIds: Record<string, string> = { ...mockUserManagerIds };

function recalculateDepartmentCounts() {
  departmentsStore = departmentsStore.map((dept) => ({
    ...dept,
    employeeCount: Object.values(userDepartmentIds).filter((id) => id === dept.id).length,
  }));
}

// Run once at module load so initial counts are correct even before any
// create/edit happens (the static numbers in mockData are just placeholders).
recalculateDepartmentCounts();

export const hrService = {
  async getDashboard(): Promise<DashboardData> {
    if (USE_MOCK) {
      const activeEmployees = usersStore.filter((u) => u.status === 'ACTIVE').length;
      const pendingApproval = appraisalsStore.filter((a) => a.status === 'MANAGER_REVIEWED').length;
      const completed = appraisalsStore.filter((a) => a.status === 'ACKNOWLEDGED').length;

      return delay({
        summary: {
          activeEmployees,
          totalAppraisals: appraisalsStore.length,
          pendingApproval,
          completed,
        },
        appraisals: appraisalsStore,
      });
    }

    // Expected real contract: GET /api/hr/dashboard -> DashboardData
    const { data } = await apiClient.get<DashboardData>('/hr/dashboard');
    return data;
  },

  // ---- Users ------------------------------------------------------------

  async getUsers(): Promise<User[]> {
    if (USE_MOCK) return delay(usersStore);

    // Expected real contract: GET /api/hr/users -> User[]
    const { data } = await apiClient.get<User[]>('/hr/users');
    return data;
  },

  async getUserFormDefaults(userId: string): Promise<{ departmentId: string; managerId: string | null }> {
    if (USE_MOCK) {
      return delay({
        departmentId: userDepartmentIds[userId] ?? '',
        managerId: userManagerIds[userId] ?? null,
      });
    }
    // Expected real contract: GET /api/hr/users/{id} -> UserResponse
    // (full response includes departmentId/managerId directly)
    const { data } = await apiClient.get(`/hr/users/${userId}`);
    return data;
  },

  async createUser(payload: UserRequest): Promise<User> {
    if (USE_MOCK) {
      const department = departmentsStore.find((d) => d.id === payload.departmentId);
      const manager = payload.managerId
        ? usersStore.find((u) => u.id === payload.managerId)
        : null;

      const newUser: User = {
        id: nextId(usersStore),
        name: payload.name,
        email: payload.email,
        role: payload.role,
        jobTitle: payload.jobTitle,
        department: department?.name ?? null,
        managerName: manager?.name ?? null,
        status: 'ACTIVE',
      };

      usersStore = [...usersStore, newUser];
      userDepartmentIds[newUser.id] = payload.departmentId;
      if (payload.managerId) userManagerIds[newUser.id] = payload.managerId;
      recalculateDepartmentCounts();

      return delay(newUser);
    }

    // Expected real contract: POST /api/hr/users { ...UserRequest } -> User
    const { data } = await apiClient.post<User>('/hr/users', payload);
    return data;
  },

  async updateUser(userId: string, payload: UserRequest): Promise<User> {
    if (USE_MOCK) {
      const department = departmentsStore.find((d) => d.id === payload.departmentId);
      const manager = payload.managerId
        ? usersStore.find((u) => u.id === payload.managerId)
        : null;

      let updated: User | undefined;
      usersStore = usersStore.map((u) => {
        if (u.id !== userId) return u;
        updated = {
          ...u,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          jobTitle: payload.jobTitle,
          department: department?.name ?? null,
          managerName: manager?.name ?? null,
        };
        return updated;
      });

      userDepartmentIds[userId] = payload.departmentId;
      if (payload.managerId) {
        userManagerIds[userId] = payload.managerId;
      } else {
        delete userManagerIds[userId];
      }
      recalculateDepartmentCounts();

      if (!updated) throw new Error('User not found');
      return delay(updated);
    }

    // Expected real contract: PUT /api/hr/users/{id} { ...UserRequest } -> User
    const { data } = await apiClient.put<User>(`/hr/users/${userId}`, payload);
    return data;
  },

  async deactivateUser(userId: string): Promise<void> {
    if (USE_MOCK) {
      usersStore = usersStore.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      );
      return delay(undefined);
    }

    // Expected real contract: PATCH /api/hr/users/{id}/status
    await apiClient.patch(`/hr/users/${userId}/status`);
  },

  // ---- Departments --------------------------------------------------------

  async getDepartments(): Promise<Department[]> {
    if (USE_MOCK) return delay(departmentsStore);

    // Expected real contract: GET /api/hr/departments -> Department[]
    const { data } = await apiClient.get<Department[]>('/hr/departments');
    return data;
  },

  async createDepartment(payload: DepartmentRequest): Promise<Department> {
    if (USE_MOCK) {
      const newDept: Department = {
        id: nextId(departmentsStore),
        name: payload.name,
        description: payload.description ?? null,
        employeeCount: 0,
      };
      departmentsStore = [...departmentsStore, newDept];
      return delay(newDept);
    }

    // Expected real contract: POST /api/hr/departments { ...DepartmentRequest } -> Department
    const { data } = await apiClient.post<Department>('/hr/departments', payload);
    return data;
  },

  async updateDepartment(departmentId: string, payload: DepartmentRequest): Promise<Department> {
    if (USE_MOCK) {
      let updated: Department | undefined;
      departmentsStore = departmentsStore.map((d) => {
        if (d.id !== departmentId) return d;
        updated = { ...d, name: payload.name, description: payload.description ?? null };
        return updated;
      });
      if (!updated) throw new Error('Department not found');
      return delay(updated);
    }

    // Expected real contract: PUT /api/hr/departments/{id} { ...DepartmentRequest } -> Department
    const { data } = await apiClient.put<Department>(`/hr/departments/${departmentId}`, payload);
    return data;
  },

  async deleteDepartment(departmentId: string): Promise<void> {
    if (USE_MOCK) {
      departmentsStore = departmentsStore.filter((d) => d.id !== departmentId);
      return delay(undefined);
    }

    // Expected real contract: DELETE /api/hr/departments/{id}
    await apiClient.delete(`/hr/departments/${departmentId}`);
  },

  // ---- Appraisals -----------------------------------------------------

  async getAppraisals(): Promise<Appraisal[]> {
    if (USE_MOCK) return delay(appraisalsStore);

    // Expected real contract: GET /api/hr/appraisals -> Appraisal[]
    const { data } = await apiClient.get<Appraisal[]>('/hr/appraisals');
    return data;
  },

  async getCycles(): Promise<Cycle[]> {
    if (USE_MOCK) return delay(cyclesStore);

    // Expected real contract: GET /api/hr/cycles -> Cycle[]
    const { data } = await apiClient.get<Cycle[]>('/hr/cycles');
    return data;
  },

  // Returns the created appraisals (1 for single mode, many for
  // department/all modes). Employees who already have an appraisal for the
  // chosen cycle are skipped silently in bulk modes, same as a sensible
  // backend would do to avoid duplicates.
  async createAppraisals(payload: CreateAppraisalRequest): Promise<Appraisal[]> {
    if (USE_MOCK) {
      const cycle = cyclesStore.find((c) => c.id === payload.cycleId);
      if (!cycle) throw new Error('Cycle not found');

      const alreadyHasAppraisal = (employeeId: string) =>
        appraisalsStore.some((a) => a.employeeId === employeeId && a.cycleId === cycle.id);

      const buildAppraisal = (employee: User): Appraisal | null => {
        if (alreadyHasAppraisal(employee.id)) return null;
        const managerId = userManagerIds[employee.id];
        const manager = managerId ? usersStore.find((u) => u.id === managerId) : null;
        const departmentId = userDepartmentIds[employee.id];
        const department = departmentsStore.find((d) => d.id === departmentId);

        return {
          id: '', // placeholder — assigned by the caller once pushed into `created`
          employeeId: employee.id,
          employeeName: employee.name,
          departmentId: departmentId ?? '',
          department: department?.name ?? employee.department ?? '—',
          managerId: managerId ?? '',
          managerName: manager?.name ?? '—',
          cycleId: cycle.id,
          cycle: cycle.name,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          rating: null,
        };
      };

      let targets: User[] = [];
      if (payload.mode === 'single') {
        const employee = usersStore.find((u) => u.id === payload.employeeId);
        if (!employee) throw new Error('Employee not found');
        targets = [employee];
      } else if (payload.mode === 'department') {
        targets = usersStore.filter(
          (u) => userDepartmentIds[u.id] === payload.departmentId && u.role !== 'HR'
        );
      } else {
        targets = usersStore.filter((u) => u.role !== 'HR');
      }

      const created: Appraisal[] = [];
      for (const employee of targets) {
        // Recompute nextId per-iteration against the growing created list
        // plus the existing store, so bulk-created appraisals get distinct
        // sequential ids instead of colliding on the same "next" number.
        const candidate = buildAppraisal(employee);
        if (!candidate) continue;
        const idBase = [...appraisalsStore, ...created];
        candidate.id = nextId(idBase.length ? idBase : [{ id: '0' }]);
        created.push(candidate);
      }

      appraisalsStore = [...appraisalsStore, ...created];

      if (created.length === 0) {
        throw new Error(
          payload.mode === 'single'
            ? 'This employee already has an appraisal for the selected cycle.'
            : 'Everyone in scope already has an appraisal for the selected cycle.'
        );
      }

      return delay(created);
    }

    // Expected real contract:
    // single:     POST /api/hr/appraisals             { employeeId, cycleId }
    // department: POST /api/hr/appraisals/bulk/department { departmentId, cycleId }
    // all:        POST /api/hr/appraisals/bulk/all     { cycleId }
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

  // Advances an appraisal exactly one step in the workflow (matches the
  // backend's linear status-transition rule — no skipping stages).
  async advanceAppraisalStatus(appraisalId: string): Promise<Appraisal> {
    if (USE_MOCK) {
      let updated: Appraisal | undefined;
      appraisalsStore = appraisalsStore.map((a) => {
        if (a.id !== appraisalId) return a;
        const currentIndex = APPRAISAL_STATUS_ORDER.indexOf(a.status);
        const nextStatus = APPRAISAL_STATUS_ORDER[currentIndex + 1];
        if (!nextStatus) return a; // already at the final stage
        updated = { ...a, status: nextStatus };
        return updated;
      });
      if (!updated) throw new Error('Appraisal not found or already complete');
      return delay(updated);
    }

    // Expected real contract: PATCH /api/hr/appraisals/{id}/status?status=NEXT_STATUS
    const current = appraisalsStore.find((a) => a.id === appraisalId);
    const currentIndex = current ? APPRAISAL_STATUS_ORDER.indexOf(current.status) : -1;
    const nextStatus: AppraisalStatus | undefined = APPRAISAL_STATUS_ORDER[currentIndex + 1];
    const { data } = await apiClient.patch<Appraisal>(
      `/hr/appraisals/${appraisalId}/status`,
      null,
      { params: { status: nextStatus } }
    );
    return data;
  },

  async deleteAppraisal(appraisalId: string): Promise<void> {
    if (USE_MOCK) {
      appraisalsStore = appraisalsStore.filter((a) => a.id !== appraisalId);
      return delay(undefined);
    }

    // Expected real contract: DELETE /api/hr/appraisals/{id}
    await apiClient.delete(`/hr/appraisals/${appraisalId}`);
  },

  async getCycleReport(cycleId: string): Promise<CycleReport> {
    if (USE_MOCK) {
      const cycle = cyclesStore.find((c) => c.id === cycleId);
      const cycleName = cycle?.name ?? cycleId;
      const cycleAppraisals = appraisalsStore.filter((a) => a.cycleId === cycleId);

      const statusBreakdown = APPRAISAL_STATUS_ORDER.map((status) => ({
        status,
        count: cycleAppraisals.filter((a) => a.status === status).length,
      }));

      const ratedAppraisals: { rating: number }[] = cycleAppraisals.filter(
        (a) => typeof a.rating === 'number'
      ) as { rating: number }[];
      const ratingDistribution = ([5, 4, 3, 2, 1] as const).map((rating) => ({
        rating,
        count: ratedAppraisals.filter((a) => Math.round(a.rating) === rating).length,
      }));
      const avgRating =
        ratedAppraisals.length > 0
          ? Math.round(
              (ratedAppraisals.reduce((sum, a) => sum + a.rating, 0) / ratedAppraisals.length) * 10
            ) / 10
          : null;

      const completedCount = cycleAppraisals.filter((a) => a.status === 'ACKNOWLEDGED').length;
      const completionPercent =
        cycleAppraisals.length > 0 ? Math.round((completedCount / cycleAppraisals.length) * 100) : 0;
      const pendingActionCount = cycleAppraisals.filter((a) => a.status !== 'ACKNOWLEDGED').length;

      const byDepartment = departmentsStore.map((dept) => {
        const deptAppraisals = cycleAppraisals.filter((a) => a.departmentId === dept.id);
        const deptCompleted = deptAppraisals.filter((a) => a.status === 'ACKNOWLEDGED').length;
        const deptRated = deptAppraisals.filter((a) => typeof a.rating === 'number');
        return {
          department: dept.name,
          employees: dept.employeeCount,
          completed: deptCompleted,
          pending: deptAppraisals.length - deptCompleted,
          avgRating:
            deptRated.length > 0
              ? Math.round(
                  (deptRated.reduce((sum, a) => sum + (a.rating ?? 0), 0) / deptRated.length) * 10
                ) / 10
              : null,
        };
      });

      const pendingActions = cycleAppraisals
        .filter((a) => a.status !== 'ACKNOWLEDGED')
        .map((a) => ({
          employeeName: a.employeeName,
          department: a.department,
          managerName: a.managerName,
          status: a.status,
        }));

      return delay({
        cycle: cycleName,
        totalAppraisals: cycleAppraisals.length,
        completionPercent,
        pendingActionCount,
        avgRating,
        statusBreakdown,
        ratingDistribution,
        byDepartment,
        pendingActions,
      });
    }

    // Expected real contract: GET /api/hr/reports?cycleId=1 -> CycleReport
    const { data } = await apiClient.get<CycleReport>('/hr/reports', {
      params: { cycleId },
    });
    return data;
  },
};