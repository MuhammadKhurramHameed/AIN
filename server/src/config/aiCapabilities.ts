// Capability keys the gateway can route. New capabilities are just new strings here —
// no code changes needed elsewhere to introduce one, per the Provider→Model→Capability
// abstraction (a feature asks for a capability, never a specific vendor/model).
export const AI_CAPABILITIES = ["chat", "lesson_assistant", "question_generation", "summarization", "translation"] as const;

export type AICapability = (typeof AI_CAPABILITIES)[number];

export const AI_CAPABILITY_LABELS: Record<AICapability, string> = {
  chat: "General chat",
  lesson_assistant: "Lesson assistant (learner-facing)",
  question_generation: "Question generation",
  summarization: "Summarization",
  translation: "Translation",
};
