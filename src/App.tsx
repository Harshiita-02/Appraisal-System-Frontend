import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HrLayout } from '@/layouts/HrLayout';
import { ManagerLayout } from '@/layouts/ManagerLayout';
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
import { ManagerComingSoonPage } from '@/pages/manager/ManagerComingSoonPage';

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
              <Route
                path="reports"
                element={
                  <ManagerComingSoonPage
                    title="Team Report"
                    description="Performance overview for your team by cycle"
                  />
                }
              />
              <Route
                path="my-appraisals"
                element={
                  <ManagerComingSoonPage
                    title="My Appraisals"
                    description="Your own appraisal cycles — as an employee"
                  />
                }
              />
              <Route
                path="my-goals"
                element={
                  <ManagerComingSoonPage title="My Goals" description="Goals assigned to you by your manager" />
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}