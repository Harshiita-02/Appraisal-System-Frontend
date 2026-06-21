import type { Appraisal, DashboardData, User, Department, Cycle, CycleReport, Goal } from '@/types';

export const mockDepartments: Department[] = [
  { id: '1', name: 'HR', description: 'People operations, hiring, and appraisals administration', employeeCount: 1 },
  { id: '2', name: 'Java Team', description: 'Backend services and core platform engineering', employeeCount: 8 },
  { id: '3', name: 'MERN STACK', description: 'Full-stack web team — MongoDB, Express, React, Node', employeeCount: 6 },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Ripudaman Singh', email: 'ripudaman@company.com', role: 'HR', jobTitle: 'Head HR', department: 'HR', managerName: null, status: 'ACTIVE' },
  { id: '2', name: 'Naruto', email: 'naruto@work.com', role: 'MANAGER', jobTitle: 'Head Manager', department: 'Java Team', managerName: null, status: 'ACTIVE' },
  { id: '3', name: 'Boruto', email: 'boruto@work.com', role: 'EMPLOYEE', jobTitle: 'Head Java Developer', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '4', name: 'RIPU', email: 'work@work.com', role: 'EMPLOYEE', jobTitle: 'Java Intern', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '5', name: 'Ripudaman', email: 'ripudamansingh1001@gmail.com', role: 'EMPLOYEE', jobTitle: 'Head Java Developer', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '6', name: 'test', email: 'teset@test.com', role: 'EMPLOYEE', jobTitle: 'test', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '7', name: 'present', email: 'present@work.com', role: 'EMPLOYEE', jobTitle: 'Java Associate', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '8', name: 'rest', email: 'rest@work.com', role: 'EMPLOYEE', jobTitle: 'Junior', department: 'Java Team', managerName: 'Naruto', status: 'ACTIVE' },
  { id: '9', name: 'Admin HR', email: 'hr@company.com', role: 'HR', jobTitle: 'HR Manager', department: null, managerName: null, status: 'ACTIVE' },
  { id: '10', name: 'Ripudaman Singh', email: 'cto@work.com', role: 'MANAGER', jobTitle: 'CTO', department: 'MERN STACK', managerName: null, status: 'ACTIVE' },
  { id: '11', name: 'Doremon', email: 'doremon@work.com', role: 'MANAGER', jobTitle: 'Team Lead', department: 'MERN STACK', managerName: 'Ripudaman Singh', status: 'ACTIVE' },
  { id: '12', name: 'Nobita', email: 'nobita@work.com', role: 'EMPLOYEE', jobTitle: 'React Developer', department: 'MERN STACK', managerName: 'Doremon', status: 'ACTIVE' },
  { id: '13', name: 'Sunio', email: 'sunio@work.com', role: 'EMPLOYEE', jobTitle: 'React developer', department: 'MERN STACK', managerName: 'Doremon', status: 'ACTIVE' },
  { id: '14', name: 'Gian', email: 'gian@work.com', role: 'EMPLOYEE', jobTitle: 'Node Developer', department: 'MERN STACK', managerName: 'Doremon', status: 'ACTIVE' },
  { id: '15', name: 'degisuki', email: 'degisuki@work.com', role: 'EMPLOYEE', jobTitle: 'JAVA', department: 'MERN STACK', managerName: 'Doremon', status: 'INACTIVE' },
  { id: '16', name: 'sizuka', email: 'sizuka@work.com', role: 'EMPLOYEE', jobTitle: 'java', department: 'MERN STACK', managerName: 'Doremon', status: 'ACTIVE' },
  { id: '17', name: 'Ripudaman', email: 'lawliet2004rathore@gmail.com', role: 'EMPLOYEE', jobTitle: 'timepass', department: 'Java Team', managerName: 'Doremon', status: 'INACTIVE' },
];

// id -> departmentId map, kept separate from User since the backend's real
// User entity will carry departmentId/managerId directly — this just lets
// the mock layer build edit-form default values without changing the
// User type's display shape used by the dashboard table.
export const mockUserDepartmentIds: Record<string, string> = {
  '1': '1', '2': '2', '3': '2', '4': '2', '5': '2', '6': '2', '7': '2', '8': '2',
  '10': '3', '11': '3', '12': '3', '13': '3', '14': '3', '15': '3', '16': '3', '17': '2',
};

export const mockUserManagerIds: Record<string, string> = {
  '3': '2', '4': '2', '5': '2', '6': '2', '7': '2', '8': '2',
  '11': '10', '12': '11', '13': '11', '14': '11', '15': '11', '16': '11', '17': '11',
};

export const mockCycles: Cycle[] = [
  { id: '1', name: 'FY-2026' },
  { id: '2', name: 'fy 25' },
  { id: '3', name: 'fy 2026' },
  { id: '4', name: 'FY 27' },
  { id: '5', name: 'Full year' },
  { id: '6', name: 'FY-2028' },
];

// employeeId/managerId/departmentId/cycleId added so the Manage Appraisals
// page can filter reliably by id rather than matching on display strings.
// selfRating/managerRating split out to match the dual-star-rating pattern
// on the Manager Dashboard (HR Reports' single `rating` mirrors selfRating).
export const mockAppraisals: Appraisal[] = [
  { id: '1', employeeId: '13', employeeName: 'Sunio', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '1', cycle: 'FY-2026', status: 'SELF_SUBMITTED', createdAt: '2026-03-31', selfRating: 1, managerRating: null, rating: 1 },
  { id: '2', employeeId: '14', employeeName: 'Gian', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '1', cycle: 'FY-2026', status: 'SELF_SUBMITTED', createdAt: '2026-03-31', selfRating: 4, managerRating: null, rating: 4 },
  { id: '3', employeeId: '12', employeeName: 'Nobita', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '1', cycle: 'FY-2026', status: 'ACKNOWLEDGED', createdAt: '2026-03-31', selfRating: 5, managerRating: 3, rating: 5 },
  { id: '4', employeeId: '11', employeeName: 'Doremon', departmentId: '3', department: 'MERN STACK', managerId: '10', managerName: 'Ripudaman Singh', cycleId: '1', cycle: 'FY-2026', status: 'EMPLOYEE_DRAFT', createdAt: '2026-03-31', startDate: '2026-03-31', endDate: '2027-03-31', selfRating: null, managerRating: null, rating: null },
  { id: '5', employeeId: '7', employeeName: 'present', departmentId: '2', department: 'Java Team', managerId: '2', managerName: 'Naruto', cycleId: '1', cycle: 'FY-2026', status: 'PENDING', createdAt: '2026-03-30', selfRating: null, managerRating: null, rating: null },
  { id: '6', employeeId: '6', employeeName: 'test', departmentId: '2', department: 'Java Team', managerId: '2', managerName: 'Naruto', cycleId: '2', cycle: 'fy 25', status: 'EMPLOYEE_DRAFT', createdAt: '2026-03-28', selfRating: null, managerRating: null, rating: null },
  { id: '7', employeeId: '5', employeeName: 'Ripudaman', departmentId: '2', department: 'Java Team', managerId: '2', managerName: 'Naruto', cycleId: '3', cycle: 'fy 2026', status: 'APPROVED', createdAt: '2026-03-27', selfRating: null, managerRating: null, rating: null },
  { id: '8', employeeId: '4', employeeName: 'RIPU', departmentId: '2', department: 'Java Team', managerId: '2', managerName: 'Naruto', cycleId: '4', cycle: 'FY 27', status: 'SELF_SUBMITTED', createdAt: '2026-03-26', selfRating: null, managerRating: null, rating: null },
  { id: '9', employeeId: '3', employeeName: 'Boruto', departmentId: '2', department: 'Java Team', managerId: '2', managerName: 'Naruto', cycleId: '5', cycle: 'Full year', status: 'ACKNOWLEDGED', createdAt: '2026-03-25', selfRating: null, managerRating: null, rating: null },
  // FY-2028 cycle — Doremon's team, matching the Manager screenshots
  { id: '10', employeeId: '11', employeeName: 'Doremon', departmentId: '3', department: 'MERN STACK', managerId: '10', managerName: 'Ripudaman Singh', cycleId: '6', cycle: 'FY-2028', status: 'PENDING', createdAt: '2028-01-01', startDate: '2028-01-01', endDate: '2028-12-01', selfRating: null, managerRating: null, rating: null },
  { id: '11', employeeId: '12', employeeName: 'Nobita', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '6', cycle: 'FY-2028', status: 'SELF_SUBMITTED', createdAt: '2028-01-05', selfRating: 4, managerRating: null, rating: 4 },
  { id: '12', employeeId: '14', employeeName: 'Gian', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '6', cycle: 'FY-2028', status: 'PENDING', createdAt: '2028-01-05', selfRating: null, managerRating: null, rating: null },
  { id: '13', employeeId: '13', employeeName: 'Sunio', departmentId: '3', department: 'MERN STACK', managerId: '11', managerName: 'Doremon', cycleId: '6', cycle: 'FY-2028', status: 'PENDING', createdAt: '2028-01-05', selfRating: null, managerRating: null, rating: null },
];

export const mockGoals: Goal[] = [
  { id: '1', appraisalId: '3', employeeId: '12', employeeName: 'Nobita', cycle: 'FY-2026', title: 'Complete React Course', description: 'Complete it', dueDate: '2026-04-10', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '2', appraisalId: '3', employeeId: '12', employeeName: 'Nobita', cycle: 'FY-2026', title: 'do this', description: 'asdfasf', dueDate: '2026-04-06', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '3', appraisalId: '3', employeeId: '12', employeeName: 'Nobita', cycle: 'FY-2026', title: 'test', description: 'test', dueDate: '2026-04-10', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '4', appraisalId: '3', employeeId: '12', employeeName: 'Nobita', cycle: 'FY-2026', title: 'test', description: 'test', dueDate: '2026-04-11', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '5', appraisalId: '2', employeeId: '14', employeeName: 'Gian', cycle: 'FY-2026', title: 'Complete Node course', description: 'complete it', dueDate: '2026-04-10', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '6', appraisalId: '1', employeeId: '13', employeeName: 'Sunio', cycle: 'FY-2026', title: 'Complete React Course', description: 'complete it', dueDate: '2026-04-10', status: 'COMPLETED', employeeResponse: 'COMPLETED' },
  { id: '7', appraisalId: '11', employeeId: '12', employeeName: 'Nobita', cycle: 'FY-2028', title: 'Complete Appraisal project', description: 'Deadline 10 days', dueDate: '2026-06-25', status: 'NOT_STARTED', employeeResponse: 'PENDING' },
];

export const mockDashboard: DashboardData = {
  summary: {
    activeEmployees: 10,
    totalAppraisals: 9,
    pendingApproval: 0,
    completed: 2,
  },
  appraisals: mockAppraisals,
};

export const mockCycleReport: CycleReport = {
  cycle: 'FY-2026',
  totalAppraisals: 5,
  completionPercent: 20,
  pendingActionCount: 4,
  avgRating: 3,
  statusBreakdown: [
    { status: 'PENDING', count: 1 },
    { status: 'EMPLOYEE_DRAFT', count: 1 },
    { status: 'SELF_SUBMITTED', count: 2 },
    { status: 'MANAGER_DRAFT', count: 0 },
    { status: 'MANAGER_REVIEWED', count: 0 },
    { status: 'APPROVED', count: 0 },
    { status: 'ACKNOWLEDGED', count: 1 },
  ],
  ratingDistribution: [
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 1 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ],
  byDepartment: [
    { department: 'HR', employees: 1, completed: 0, pending: 1, avgRating: null },
    { department: 'Java Team', employees: 8, completed: 0, pending: 8, avgRating: null },
    { department: 'MERN STACK', employees: 6, completed: 1, pending: 5, avgRating: 3 },
  ],
  pendingActions: [
    { employeeName: 'present', department: 'Java Team', managerName: 'Naruto', status: 'PENDING' },
    { employeeName: 'Doremon', department: 'MERN STACK', managerName: 'Ripudaman Singh', status: 'EMPLOYEE_DRAFT' },
    { employeeName: 'Gian', department: 'MERN STACK', managerName: 'Doremon', status: 'SELF_SUBMITTED' },
    { employeeName: 'Sunio', department: 'MERN STACK', managerName: 'Doremon', status: 'SELF_SUBMITTED' },
  ],
};