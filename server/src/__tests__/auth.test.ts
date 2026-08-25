import request from "supertest";
import { app } from "../app";
import { startTestDb, stopTestDb } from "./helpers/testDb";
import { createUser, TEST_PASSWORD } from "./helpers/fixtures";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("auth", () => {
  it("rejects a wrong password with 401 and no cookie", async () => {
    const user = await createUser("super_admin", { email: "wrongpw@test.local" });
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: "not-the-password" });
    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("logs in with correct credentials and sets an httpOnly session cookie", async () => {
    const user = await createUser("super_admin", { email: "rightpw@test.local" });
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it("rejects requests with no session on a protected route", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("enforces server-side RBAC — a trainee gets 403 on a super-admin-only route, not just a hidden button", async () => {
    const trainee = await createUser("trainee", { email: "trainee.rbac@test.local" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: trainee.email, password: TEST_PASSWORD });

    const res = await agent.get("/api/audit-logs");
    expect(res.status).toBe(403);
  });

  it("lets a super admin read the audit log, and login events are actually recorded there", async () => {
    const admin = await createUser("super_admin", { email: "auditor@test.local" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: admin.email, password: TEST_PASSWORD });

    const res = await agent.get("/api/audit-logs?action=login");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.logs.some((l: any) => l.actorEmail === admin.email && l.success)).toBe(true);
  });
});
