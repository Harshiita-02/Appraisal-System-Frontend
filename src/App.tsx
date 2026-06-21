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
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboard';
import { MyTeamPage } from '@/pages/manager/MyTeamPage';
import { TeamGoalsPage } from '@/pages/manager/TeamGoalsPage';
import { TeamReportPage } from '@/pages/manager/TeamReportPage';
import { MyAppraisalsPage } from '@/pages/manager/MyAppraisalsPage';
import { MyGoalsPage } from '@/pages/manager/MyGoalsPage';
import { EmployeeDashboardPage } from '@/pages/employee/EmployeeDashboardPage';
import { EmployeeAppraisalsPage } from '@/pages/employee/EmployeeAppraisalsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/hr"
              element={
                <ProtectedRoute>
                  <HrLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HrDashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="appraisals" element={<ManageAppraisalsPage />} />
              <Route path="appraisals/create" element={<CreateAppraisalPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route
              path="/manager"
              element={
                <ProtectedRoute>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboardPage />} />
              <Route path="team" element={<MyTeamPage />} />
              <Route path="goals" element={<TeamGoalsPage />} />
              <Route path="reports" element={<TeamReportPage />} />
              <Route path="my-appraisals" element={<MyAppraisalsPage />} />
              <Route path="my-goals" element={<MyGoalsPage />} />
            </Route>

            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboardPage />} />
              <Route path="appraisals" element={<EmployeeAppraisalsPage />} />
              <Route path="goals" element={<div className="text-center py-10">Goals page coming soon</div>} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}