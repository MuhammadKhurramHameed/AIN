import request from "supertest";
import { app } from "../app";
import { startTestDb, stopTestDb } from "./helpers/testDb";
import { createUser, createProgrammeTrackCourse, TEST_PASSWORD } from "./helpers/fixtures";
import { Lesson } from "../models/Lesson";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("assessment engine: question bank + pool-based, server-secured quiz attempts", () => {
  async function loginAgent(email: string) {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email, password: TEST_PASSWORD });
    return agent;
  }

  async function setUpPoolQuiz() {
    const admin = await createUser("super_admin");
    const { course } = await createProgrammeTrackCourse(admin.id);
    const lesson = await Lesson.create({ courseId: course.id, title: "Quiz Lesson", type: "quiz", order: 0 });

    const adminAgent = await loginAgent(admin.email);
    const q1 = await adminAgent.post("/api/questions").send({
      courseId: course.id,
      text: "Pick the languages",
      type: "multi_select",
      options: [{ id: "a", text: "Python" }, { id: "b", text: "HTML" }, { id: "c", text: "JavaScript" }],
      correctOptionIds: ["a", "c"],
      status: "approved",
    });
    expect(q1.status).toBe(201);

    const q2 = await adminAgent.post("/api/questions").send({
      courseId: course.id,
      text: "Sky is blue",
      type: "true_false",
      options: [{ id: "t", text: "True" }, { id: "f", text: "False" }],
      correctOptionIds: ["t"],
      status: "approved",
    });
    expect(q2.status).toBe(201);

    const quiz = await adminAgent.post("/api/quizzes").send({
      lessonId: lesson.id,
      title: "Pool Quiz",
      passScore: 60,
      questionBankIds: [q1.body.question._id, q2.body.question._id],
      questionCount: 2,
      timeLimitMinutes: 5,
      maxAttempts: 1,
      randomizeOptions: true,
    });
    expect(quiz.status).toBe(201);

    const trainee = await createUser("trainee");
    const traineeAgent = await loginAgent(trainee.email);
    return { quizId: quiz.body.quiz._id, traineeAgent };
  }

  it("never sends correctOptionIds to the client while an attempt is in progress", async () => {
    const { quizId, traineeAgent } = await setUpPoolQuiz();
    const start = await traineeAgent.post(`/api/quizzes/${quizId}/start`).send();
    expect(start.status).toBe(201);
    const raw = JSON.stringify(start.body);
    expect(raw).not.toMatch(/correctOptionIds/);
  });

  it("grades correctly, blocks resubmitting the same attempt, and enforces maxAttempts", async () => {
    const { quizId, traineeAgent } = await setUpPoolQuiz();
    const start = await traineeAgent.post(`/api/quizzes/${quizId}/start`).send();
    const attemptId = start.body.attemptId;
    const questions: { type: string; options: { id: string; text: string }[] }[] = start.body.questions;

    const answers = questions.map((q, questionIndex) => {
      if (q.type === "multi_select") {
        const ids = q.options.filter((o) => o.text === "Python" || o.text === "JavaScript").map((o) => o.id);
        return { questionIndex, selectedOptionIds: ids };
      }
      const trueOpt = q.options.find((o) => o.text === "True");
      return { questionIndex, selectedOptionIds: trueOpt ? [trueOpt.id] : [] };
    });

    const submit = await traineeAgent.post(`/api/quizzes/attempts/${attemptId}/submit`).send({ answers });
    expect(submit.status).toBe(200);
    expect(submit.body.attempt.score).toBe(100);
    expect(submit.body.attempt.passed).toBe(true);

    const resubmit = await traineeAgent.post(`/api/quizzes/attempts/${attemptId}/submit`).send({ answers });
    expect(resubmit.status).toBe(400);

    const secondStart = await traineeAgent.post(`/api/quizzes/${quizId}/start`).send();
    expect(secondStart.status).toBe(403); // maxAttempts: 1, already used
  });

  it("scores 0% when every answer is wrong, and never crashes on an empty submission", async () => {
    const { quizId, traineeAgent } = await setUpPoolQuiz();
    const start = await traineeAgent.post(`/api/quizzes/${quizId}/start`).send();
    const attemptId = start.body.attemptId;
    const questions = start.body.questions as unknown[];

    const submit = await traineeAgent
      .post(`/api/quizzes/attempts/${attemptId}/submit`)
      .send({ answers: questions.map((_, questionIndex) => ({ questionIndex, selectedOptionIds: [] })) });
    expect(submit.status).toBe(200);
    expect(submit.body.attempt.score).toBe(0);
    expect(submit.body.attempt.passed).toBe(false);
  });

  it("rejects a trainee submitting to someone else's attempt", async () => {
    const { quizId, traineeAgent } = await setUpPoolQuiz();
    const start = await traineeAgent.post(`/api/quizzes/${quizId}/start`).send();
    const attemptId = start.body.attemptId;

    const otherTrainee = await createUser("trainee");
    const otherAgent = await loginAgent(otherTrainee.email);
    const res = await otherAgent.post(`/api/quizzes/attempts/${attemptId}/submit`).send({ answers: [] });
    expect(res.status).toBe(403);
  });
});
