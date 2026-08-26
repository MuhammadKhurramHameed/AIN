import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Partners from "./pages/Partners";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Cohorts from "./pages/Cohorts";
import Kanban from "./pages/Kanban";
import Reports from "./pages/Reports";
import Certificates from "./pages/Certificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import AIControlCenter from "./pages/admin/AIControlCenter";
import Integrations from "./pages/admin/Integrations";
import Programmes from "./pages/admin/Programmes";
import QuestionBank from "./pages/admin/QuestionBank";
import Security from "./pages/Security";
import AuditLog from "./pages/admin/AuditLog";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify/:code" element={<VerifyCertificate />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/kanban" element={<Kanban />} />

          <Route element={<ProtectedRoute roles={["super_admin", "moitt_staff", "content_admin", "tutor"]} />}>
            <Route path="/cohorts" element={<Cohorts />} />
          </Route>

          <Route element={<ProtectedRoute roles={["super_admin", "moitt_staff", "content_admin", "content_reviewer"]} />}>
            <Route path="/question-bank" element={<QuestionBank />} />
          </Route>
          <Route path="/certificates" element={<Certificates />} />

          <Route element={<ProtectedRoute roles={["super_admin", "moitt_staff", "consortium_partner_admin"]} />}>
            <Route path="/users" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute roles={["super_admin", "moitt_staff"]} />}>
            <Route path="/partners" element={<Partners />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                roles={[
                  "super_admin",
                  "moitt_staff",
                  "content_reviewer",
                  "consortium_partner_admin",
                  "consortium_partner_staff",
                ]}
              />
            }
          >
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute roles={["super_admin"]} />}>
            <Route path="/admin/ai" element={<AIControlCenter />} />
            <Route path="/admin/integrations" element={<Integrations />} />
            <Route path="/admin/programmes" element={<Programmes />} />
            <Route path="/admin/audit-log" element={<AuditLog />} />
          </Route>

          <Route
            element={<ProtectedRoute roles={["super_admin", "moitt_staff", "content_admin", "content_reviewer"]} />}
          >
            <Route path="/security" element={<Security />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
