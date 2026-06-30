// ---------------------------------------------------------------------------
// Domain types. These are shaped after the reference screenshots. Once you
// share your Spring Boot entities/DTOs, these should be updated to match
// field names and casing exactly (Java commonly serializes camelCase JSON
// by default via Jackson, which is assumed below).
// ---------------------------------------------------------------------------

export type Role = 'HR' | 'MANAGER' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
  department: string | null;
  managerName: string | null;
  status: UserStatus;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  employeeCount: number;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string; // optional on update — blank means "keep existing"
  role: Role;
  jobTitle: string;
  departmentId: string;
  managerId?: string | null;
}

export type AppraisalStatus =
  | 'PENDING'
  | 'EMPLOYEE_DRAFT'
  | 'SELF_SUBMITTED'
  | 'MANAGER_DRAFT'
  | 'MANAGER_REVIEWED'
  | 'APPROVED'
  | 'ACKNOWLEDGED';

// Linear workflow order — mirrors the backend's validateStatusTransition
// rule (each status can only advance to the single next stage).
export const APPRAISAL_STATUS_ORDER: AppraisalStatus[] = [
  'PENDING',
  'EMPLOYEE_DRAFT',
  'SELF_SUBMITTED',
  'MANAGER_DRAFT',
  'MANAGER_REVIEWED',
  'APPROVED',
  'ACKNOWLEDGED',
];

export const APPRAISAL_STATUS_LABELS: Record<AppraisalStatus, string> = {
  PENDING: 'Pending',
  EMPLOYEE_DRAFT: 'Employee Draft',
  SELF_SUBMITTED: 'Self Submitted',
  MANAGER_DRAFT: 'Manager Draft',
  MANAGER_REVIEWED: 'Manager Reviewed',
  APPROVED: 'Approved',
  ACKNOWLEDGED: 'Acknowledged',
};

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  departmentId: string;
  department: string;
  managerId: string;
  managerName: string;
  cycleId: string;
  cycle: string;
  status: AppraisalStatus;
  createdAt: string; // ISO date string
  startDate?: string;
  endDate?: string;
  selfRating?: number | null;
  managerRating?: number | null;
  whatWentWell?: string | null;
  whatToImprove?: string | null;
  keyAchievements?: string | null;
  managerComments?: string | null;
  /** @deprecated kept for the HR Reports page; equals selfRating for now */
  rating?: number | null;
}

export interface Cycle {
  id: string;
  name: string;
}

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export interface ManagerReviewRequest {
  managerRating: number;
  managerComments?: string;
}

export type GoalEmployeeResponse = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_COMPLETED';

export interface Goal {
  id: string;
  appraisalId: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  cycle: string;
  title: string;
  description: string | null;
  dueDate: string; // ISO date string
  status: GoalStatus;
  employeeResponse: GoalEmployeeResponse;
  employeeNote?: string | null;
}

export interface GoalRequest {
  appraisalId: string;
  title: string;
  description?: string;
  dueDate: string;
}

export interface EmployeeGoalCompletionRequest {
  completed: boolean | null;
  note?: string;
}

export interface EmployeeDashboardData {
  activeAppraisals: number;
  goalsInProgress: number;
  unreadNotifications: number;
  appraisals: Appraisal[];
}

// Submitted by an employee when filling out their own self-assessment —
// moves the appraisal from PENDING/EMPLOYEE_DRAFT to SELF_SUBMITTED.
// Field names match the reference UI's form exactly: "What Went Well",
// "What Could I Improve", "Key Achievements", "Self Rating".
export interface SelfAssessmentRequest {
  whatWentWell: string;
  whatToImprove: string;
  keyAchievements: string;
  selfRating: number;
}

// The three creation modes mirror the reference UI's tabs on the Create
// Appraisal screen.
export interface CreateSingleAppraisalRequest {
  mode: 'single';
  employeeId: string;
  cycleId: string;
}

export interface CreateByDepartmentRequest {
  mode: 'department';
  departmentId: string;
  cycleId: string;
}

export interface CreateAllEmployeesRequest {
  mode: 'all';
  cycleId: string;
}

export type CreateAppraisalRequest =
  | CreateSingleAppraisalRequest
  | CreateByDepartmentRequest
  | CreateAllEmployeesRequest;

export interface DashboardSummary {
  activeEmployees: number;
  totalAppraisals: number;
  pendingApproval: number;
  completed: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  appraisals: Appraisal[];
}

// ---- Manager -------------------------------------------------------------

export interface ManagerDashboardSummary {
  teamSize: number;
  activeReviews: number;
  awaitingMyReview: number;
  completed: number;
}

export interface ManagerDashboardData {
  summary: ManagerDashboardSummary;
  myAppraisals: Appraisal[]; // manager's own appraisals, as someone else's report
  teamAppraisals: Appraisal[]; // manager's direct reports' appraisals
}

export interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  department: string | null;
  email: string;
  status: UserStatus;
}

export interface TeamReportRow {
  appraisalId: string | null; // NEW
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  jobTitle: string;
  status: AppraisalStatus;
  selfRating: number | null;
  managerRating: number | null;
  goalsCompleted: number;
  goalsTotal: number;
}

export interface TeamReport {
  cycle: string;
  teamMembers: number;
  avgRating: number | null;
  rows: TeamReportRow[];
}

export interface AppraisalFilters {
  status?: AppraisalStatus | 'ALL';
  department?: string | 'ALL';
  cycle?: string | 'ALL';
  search?: string;
}

// ---- Auth -------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ---- Reports ------------------------------------------------------------

export interface StatusBreakdownEntry {
  status: AppraisalStatus;
  count: number;
}

export interface RatingDistributionEntry {
  rating: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface DepartmentReportRow {
  department: string;
  employees: number;
  completed: number;
  pending: number;
  avgRating: number | null;
}

export interface PendingActionRow {
  employeeName: string;
  employeeRole?: string;
  department: string;
  managerName: string;
  status: AppraisalStatus;
}

export interface CycleReport {
  cycle: string;
  totalAppraisals: number;
  completionPercent: number;
  pendingActionCount: number;
  avgRating: number | null;
  statusBreakdown: StatusBreakdownEntry[];
  ratingDistribution: RatingDistributionEntry[];
  byDepartment: DepartmentReportRow[];
  pendingActions: PendingActionRow[];
}

// Matches the backend's NotificationType enum (entity/enums/NotificationType.java)
export type NotificationCategory = 'INFO' | 'WARNING' | 'SUCCESS' | 'APPRAISAL' | 'REVIEW' | 'GOAL';

/**
 * BUG FIX: id changed from string to number.
 *
 * The backend's Notification entity uses a Long primary key, which Jackson
 * serialises as a JSON number (e.g. 42), not a quoted string (e.g. "42").
 * Typing id as string meant TypeScript silently accepted the mismatch, but
 * at runtime notificationService.markAsRead(n.id) was constructing URLs like
 * /notifications/42/read correctly only by accident (JS coerces number→string
 * in template literals). The real risk is any strict equality check
 * (n.id === someStringId) silently failing.
 *
 * Keeping it as number matches the wire format exactly and removes the
 * coercion reliance. The URL template literal `${notificationId}` still
 * works fine with a number.
 */
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationCategory;
  isRead: boolean;
  createdAt: string; // ISO 8601 string: "2024-01-15T10:30:00" (fixed in backend)
}