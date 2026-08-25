const DOT_COLORS: Record<string, string> = {
  enrollment_created: "bg-blue-400",
  enrollment_completed: "bg-emerald-500",
  report_submitted: "bg-amber-500",
  report_reviewed: "bg-emerald-500",
  kanban_card_created: "bg-slate-400",
  kanban_card_done: "bg-emerald-500",
  user_created: "bg-brand-500",
  course_published: "bg-purple-500",
};

export function activityDotColor(type: string): string {
  return DOT_COLORS[type] ?? "bg-slate-400";
}
