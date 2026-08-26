import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { globalLimiter } from "./middleware/rateLimit";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import partnerRoutes from "./routes/partners.routes";
import trackRoutes from "./routes/tracks.routes";
import courseRoutes from "./routes/courses.routes";
import lessonRoutes from "./routes/lessons.routes";
import enrollmentRoutes from "./routes/enrollments.routes";
import quizRoutes from "./routes/quizzes.routes";
import certificateRoutes from "./routes/certificates.routes";
import kanbanRoutes from "./routes/kanban.routes";
import reportRoutes from "./routes/reports.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import activityRoutes from "./routes/activity.routes";
import aiRoutes from "./routes/ai.routes";
import integrationRoutes from "./routes/integrations.routes";
import programmeRoutes from "./routes/programmes.routes";
import cohortRoutes from "./routes/cohorts.routes";
import attendanceRoutes from "./routes/attendance.routes";
import questionRoutes from "./routes/questions.routes";
import auditLogRoutes from "./routes/auditLogs.routes";

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/cohorts", cohortRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
