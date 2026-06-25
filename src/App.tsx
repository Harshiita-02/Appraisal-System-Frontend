import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HrLayout } from '@/layouts/HrLayout';
import { ManagerLayout } from '@/layouts/ManagerLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { HrDashboardPage } from '@/pages/hr/HrDashboardPage';
import { UsersPage } from '@/pages/hr/UsersPage';
import { DepartmentsPage } from '@/pages/hr/DepartmentsPage';
import { ManageAppraisalsPage } from '@/pages/hr/ManageAppraisalsPage';
import { CreateAppraisalPage } from '@/pages/hr/CreateAppraisalPage';
import { ReportsPage } from '@/pages/hr/ReportsPage';
import { GoalsPage as HrGoalsPage } from '@/pages/hr/GoalsPage';
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboard';
import { MyTeamPage } from '@/pages/manager/MyTeamPage';
import { TeamGoalsPage } from '@/pages/manager/TeamGoalsPage';
import { TeamReportPage } from '@/pages/manager/TeamReportPage';
import { MyAppraisalsPage as ManagerMyAppraisalsPage } from '@/pages/manager/MyAppraisalsPage';
import { MyGoalsPage as ManagerMyGoalsPage } from '@/pages/manager/MyGoalsPage';
import { ReviewsPage as ManagerReviewsPage } from '@/pages/manager/ReviewsPage';
import { AppraisalGuidePage } from '@/pages/employee/AppraisalGuide';
import { EmployeeDashboardPage } from '@/pages/employee/EmployeeDashboardPage';
import { MyAppraisalsPage as EmployeeMyAppraisalsPage } from '@/pages/employee/MyAppraisalsPage';
import { SelfAssessmentPage } from '@/pages/employee/SelfAssessmentPage';
import { MyGoalsPage as EmployeeMyGoalsPage } from '@/pages/employee/MyGoalsPage';
import { MyReviewsPage } from '@/pages/employee/MyReviews';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/hr"element={<ProtectedRoute><HrLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HrDashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="appraisals" element={<ManageAppraisalsPage />} />
              <Route path="appraisals/create" element={<CreateAppraisalPage />} />
              <Route path="goals" element={<HrGoalsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="/manager"element={<ProtectedRoute>  <ManagerLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboardPage />} />
              <Route path="team" element={<MyTeamPage />} />
              <Route path="goals" element={<TeamGoalsPage />} />
              <Route path="reports" element={<TeamReportPage />} />
              <Route path="my-appraisals" element={<ManagerMyAppraisalsPage />} />
              <Route path="my-goals" element={<ManagerMyGoalsPage />} />
              <Route path="reviews" element={<ManagerReviewsPage />} />
            </Route>

            <Route path="/employee"element={ <ProtectedRoute> <EmployeeLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="guide" element={<AppraisalGuidePage />} />
              <Route path="dashboard" element={<EmployeeDashboardPage />} />
              <Route path="appraisals" element={<EmployeeMyAppraisalsPage />} />
              <Route path="appraisals/:id/self-assessment" element={<SelfAssessmentPage />} />
              <Route path="goals" element={<EmployeeMyGoalsPage />} />
              <Route path="reviews" element={<MyReviewsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}