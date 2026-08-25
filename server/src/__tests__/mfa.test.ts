import request from "supertest";
import { authenticator } from "@otplib/preset-v11";
import { app } from "../app";
import { startTestDb, stopTestDb } from "./helpers/testDb";
import { createUser, TEST_PASSWORD } from "./helpers/fixtures";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("MFA (TOTP) for staff/admin accounts", () => {
  it("blocks MFA setup for a role that isn't staff/admin (trainees don't get this control plane)", async () => {
    const trainee = await createUser("trainee", { email: "mfa.trainee@test.local" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: trainee.email, password: TEST_PASSWORD });

    const res = await agent.post("/api/auth/mfa/setup").send();
    expect(res.status).toBe(403);
  });

  it("rejects verify-setup with a wrong code and does not enable MFA", async () => {
    const admin = await createUser("super_admin", { email: "mfa.wrongcode@test.local" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: admin.email, password: TEST_PASSWORD });

    const setup = await agent.post("/api/auth/mfa/setup").send();
    expect(setup.status).toBe(200);
    expect(setup.body.secret).toBeTruthy();
    expect(setup.body.qrDataUrl).toMatch(/^data:image\/png;base64,/);

    const badVerify = await agent.post("/api/auth/mfa/verify-setup").send({ code: "000000" });
    expect(badVerify.status).toBe(400);

    const me = await agent.get("/api/auth/me");
    expect(me.body.user.mfaEnabled).toBe(false);
  });

  it("full lifecycle: setup -> verify with a real TOTP code -> subsequent login requires a second factor -> completes with a fresh code", async () => {
    const admin = await createUser("super_admin", { email: "mfa.full@test.local" });
    const setupAgent = request.agent(app);
    await setupAgent.post("/api/auth/login").send({ email: admin.email, password: TEST_PASSWORD });

    const setup = await setupAgent.post("/api/auth/mfa/setup").send();
    const secret = setup.body.secret as string;

    const code1 = authenticator.generate(secret);
    const verify = await setupAgent.post("/api/auth/mfa/verify-setup").send({ code: code1 });
    expect(verify.status).toBe(200);

    // A fresh login (no session) must now stop at password-only and demand the second factor.
    const freshAgent = request.agent(app);
    const login = await freshAgent.post("/api/auth/login").send({ email: admin.email, password: TEST_PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.mfaRequired).toBe(true);
    expect(login.body.mfaToken).toBeTruthy();
    // No session cookie yet — password alone must not grant access.
    const meBeforeMfa = await freshAgent.get("/api/auth/me");
    expect(meBeforeMfa.status).toBe(401);

    const code2 = authenticator.generate(secret);
    const mfaLogin = await freshAgent.post("/api/auth/mfa/login").send({ mfaToken: login.body.mfaToken, code: code2 });
    expect(mfaLogin.status).toBe(200);
    expect(mfaLogin.body.user.email).toBe(admin.email);

    const meAfterMfa = await freshAgent.get("/api/auth/me");
    expect(meAfterMfa.status).toBe(200);
  });

  it("rejects a garbage mfaToken on the second-factor endpoint", async () => {
    const res = await request(app).post("/api/auth/mfa/login").send({ mfaToken: "not-a-real-token", code: "123456" });
    expect(res.status).toBe(401);
  });
});
