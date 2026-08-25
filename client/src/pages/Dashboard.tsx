import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getActivitySocket } from "../api/activitySocket";
import { Card, CardHeader } from "../components/ui/Card";
import { MiniProgressRing, MiniProgressBar, MiniStackedBar, MiniDots, CountBadge } from "../components/ui/MiniViz";
import {
  UsersIcon,
  CheckCircleIcon,
  ScaleIcon,
  LayersIcon,
  GraduationCapIcon,
  BuildingIcon,
  ActivityIcon,
  UserPlusIcon,
  ClipboardCheckIcon,
  FileClockIcon,
  ColumnsIcon,
  CheckSquareIcon,
} from "../components/ui/icons";
import { RegionMap } from "../components/Dashboard/RegionMap";
import { MetricTile } from "../components/Dashboard/MetricTile";
import {
  SimpleBreakdownTable,
  TutorBreakdown,
  EngagementBreakdown,
  QuizBreakdown,
  KanbanBreakdown,
  ReportsPendingList,
} from "../components/Dashboard/TileDetails";
import { timeAgo } from "../lib/time";
import { Enrollment, Programme } from "../types";

const CHART_COLORS = ["#4a5fe0", "#0e7a63", "#a86a15", "#b23a24", "#31419e", "#7a8095"];
const LEVEL_LABELS: Record<string, string> = {
  level_1: "Level 1 — AI Literacy",
  level_2: "Level 2 — Applied AI",
  level_3: "Level 3 — Advanced",
};
const POLL_INTERVAL_MS = 30_000;

interface Overview {
  totalTrainees: number;
  completionRate: number;
  femalePct: number;
  activeTracks: number;
  trainerCount: number;
  activePartners: number;
  activeTraineesToday: number;
  newEnrollmentsThisWeek: number;
  quizAttemptsThisWeek: number;
  reportsPendingReview: number;
  kanbanOpenCards: number;
  kanbanDoneCards: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "trainee") return <TraineeDashboard />;
  return <StaffDashboard />;
}

function LiveBadge({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Live{lastUpdated ? ` · updated ${timeAgo(lastUpdated.toISOString())}` : ""}
    </div>
  );
}

const PROGRAMME_FILTER_ROLES = new Set(["super_admin", "moitt_staff"]);

function StaffDashboard() {
  const { user } = useAuth();
  const canFilterByProgramme = !!user && PROGRAMME_FILTER_ROLES.has(user.role);

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [programmeId, setProgrammeId] = useState<string>("");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [byTrack, setByTrack] = useState<{ track: string; enrolled: number; completed: number }[]>([]);
  const [genderSplit, setGenderSplit] = useState<{ gender: string; count: number }[]>([]);
  const [trend, setTrend] = useState<{ month: string; completed: number }[]>([]);
  const [byLevel, setByLevel] = useState<{ level: string; enrolled: number; completed: number; completionRate: number }[]>([]);
  const [partners, setPartners] = useState<{ partner: string; enrolled: number; completed: number; dropouts: number; avgFemalePct: number }[]>([]);
  const [regional, setRegional] = useState<{ region: string; trainees: number }[]>([]);
  const [pulsingRegions, setPulsingRegions] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (canFilterByProgramme) api.get("/programmes").then((r) => setProgrammes(r.data.programmes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFilterByProgramme]);

  const refetchAll = useCallback(() => {
    const qs = programmeId ? `?programmeId=${programmeId}` : "";
    api.get(`/dashboard/overview${qs}`).then((r) => setOverview(r.data));
    api.get(`/dashboard/enrollment-by-track${qs}`).then((r) => setByTrack(r.data.data));
    api.get(`/dashboard/gender-split${qs}`).then((r) => setGenderSplit(r.data.data));
    api.get(`/dashboard/completion-trend${qs}`).then((r) => setTrend(r.data.data));
    api.get(`/dashboard/level-breakdown${qs}`).then((r) => setByLevel(r.data.data));
    api.get(`/dashboard/regional-density${qs}`).then((r) => setRegional(r.data.data));
    api
      .get("/dashboard/partner-performance")
      .then((r) => setPartners(r.data.data))
      .catch(() => setPartners([]));
    setLastUpdated(new Date());
  }, [programmeId]);

  useEffect(() => {
    refetchAll();
    const interval = setInterval(refetchAll, POLL_INTERVAL_MS);

    const socket = getActivitySocket();
    const onActivity = (entry: { region?: string }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(refetchAll, 800);

      if (entry.region) {
        const region = entry.region;
        setPulsingRegions((prev) => new Set(prev).add(region));
        setTimeout(() => {
          setPulsingRegions((prev) => {
            const next = new Set(prev);
            next.delete(region);
            return next;
          });
        }, 2500);
      }
    };
    socket.on("activity", onActivity);

    return () => {
      clearInterval(interval);
      socket.off("activity", onActivity);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [refetchAll]);

  const kanbanTotal = (overview?.kanbanOpenCards ?? 0) + (overview?.kanbanDoneCards ?? 0);
  const kanbanThroughputPct = kanbanTotal > 0 ? ((overview?.kanbanDoneCards ?? 0) / kanbanTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Programme Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {programmeId
              ? `Live rollup for ${programmes.find((p) => p.id === programmeId)?.name ?? "the selected programme"}.`
              : "Live rollup across all programmes, tracks, and consortium partners."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canFilterByProgramme && programmes.length > 0 && (
            <label className="text-sm">
              <span className="sr-only">Filter by programme</span>
              <select className="input" value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}>
                <option value="">All programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <LiveBadge lastUpdated={lastUpdated} />
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricTile
            label="Trainees"
            value={overview.totalTrainees.toLocaleString()}
            title="Trainees"
            subtitle="Total registered across all 9 tracks"
            guidance="Total registered trainees, all tracks. Compare against the tender's 20,000-participant target, and check the track/gender/region mix below for concentration that might mean outreach isn't reaching everyone evenly."
            wide
            icon={<UsersIcon />}
            visual={<MiniStackedBar segments={genderSplit.map((g, i) => ({ value: g.count, color: CHART_COLORS[i % CHART_COLORS.length] }))} />}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">By gender</div>
                <SimpleBreakdownTable rows={genderSplit.map((g) => ({ label: g.gender, value: g.count }))} keyLabel="Gender" valueLabel="Trainees" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">By region</div>
                <SimpleBreakdownTable rows={regional.map((r) => ({ label: r.region, value: r.trainees }))} keyLabel="Region" valueLabel="Trainees" />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">Enrollments by track</div>
                <SimpleBreakdownTable rows={byTrack.map((t) => ({ label: t.track, value: t.enrolled }))} keyLabel="Track" valueLabel="Enrollments" />
              </div>
            </div>
          </MetricTile>

          <MetricTile
            label="Completion rate"
            value={`${overview.completionRate}%`}
            title="Completion rate"
            subtitle="Share of enrollments reaching 100% progress"
            guidance="Completion rate is the share of enrollments that reached 100% progress. Sustained rates below ~40% in a track or level often signal a need for tutor support, pacing changes, or connectivity barriers worth investigating."
            icon={<CheckCircleIcon />}
            visual={<MiniProgressRing value={overview.completionRate} tone={overview.completionRate >= 40 ? "good" : "warn"} size={28} />}
          >
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">By track</div>
                <SimpleBreakdownTable
                  rows={byTrack.map((t) => ({ label: t.track, value: t.enrolled > 0 ? Math.round((t.completed / t.enrolled) * 100) : 0 }))}
                  keyLabel="Track"
                  valueLabel="Completion %"
                />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">By level</div>
                <SimpleBreakdownTable
                  rows={byLevel.map((l) => ({ label: LEVEL_LABELS[l.level] ?? l.level, value: l.completionRate }))}
                  keyLabel="Level"
                  valueLabel="Completion %"
                />
              </div>
            </div>
          </MetricTile>

          <MetricTile
            label="Female participation"
            value={`${overview.femalePct}%`}
            hint="Target ≥30%"
            title="Female participation"
            subtitle="Programme-wide gender split"
            guidance="Female participation below the programme's 30% target in a specific track or region is a compliance risk worth flagging to the M&E team ahead of the next reporting cycle — check the regional map for the per-region breakdown."
            icon={<ScaleIcon />}
            visual={<MiniProgressBar value={overview.femalePct} target={30} tone={overview.femalePct >= 30 ? "good" : "bad"} />}
          >
            <SimpleBreakdownTable rows={genderSplit.map((g) => ({ label: g.gender, value: g.count }))} keyLabel="Gender" valueLabel="Trainees" />
          </MetricTile>

          <MetricTile
            label="Active tracks"
            value={overview.activeTracks}
            title="Active tracks"
            subtitle="All 9 MoITT participant categories"
            guidance="All 9 tender participant categories currently have live, published courses. Use this list to confirm none has quietly gone dormant."
            icon={<LayersIcon />}
            visual={<MiniDots filled={overview.activeTracks} total={overview.activeTracks} tone="good" />}
          >
            <SimpleBreakdownTable rows={byTrack.map((t) => ({ label: t.track, value: t.enrolled }))} keyLabel="Track" valueLabel="Enrollments" />
          </MetricTile>

          <MetricTile
            label="Tutors"
            value={overview.trainerCount}
            title="Tutors"
            subtitle="Qualified trainers, by track"
            guidance="Total qualified trainers across the programme. The tender scores bids on trainer count (16–20+ trainers scores highest) — this breakdown shows how they're distributed across tracks, so you can spot tracks that are thin on instructors."
            icon={<GraduationCapIcon />}
            visual={
              <MiniProgressBar
                value={Math.min(100, (overview.trainerCount / 20) * 100)}
                target={80}
                tone={overview.trainerCount >= 16 ? "good" : "warn"}
              />
            }
          >
            <TutorBreakdown programmeId={programmeId} />
          </MetricTile>

          <MetricTile
            label="Active partners"
            value={overview.activePartners}
            title="Active consortium partners"
            subtitle="Reported delivery metrics, rolled up"
            guidance="Consortium delivery partners currently in active status, with their latest reported enrollment and completion numbers."
            wide
            icon={<BuildingIcon />}
            visual={<MiniDots filled={overview.activePartners} total={overview.activePartners} tone="good" />}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="py-1.5 font-medium">Partner</th>
                  <th className="py-1.5 font-medium">Enrolled</th>
                  <th className="py-1.5 font-medium">Completed</th>
                  <th className="py-1.5 font-medium">Avg % female</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.partner} className="border-b border-slate-50">
                    <td className="py-1.5">{p.partner}</td>
                    <td className="py-1.5 tabular-nums">{p.enrolled}</td>
                    <td className="py-1.5 tabular-nums">{p.completed}</td>
                    <td className="py-1.5 tabular-nums">{p.avgFemalePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MetricTile>
        </div>
      )}

      {overview && (
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">Engagement this week</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricTile
              label="Active today"
              value={overview.activeTraineesToday}
              hint="Trainees with progress today"
              title="Active today"
              subtitle="Enrollment records touched in the last 24 hours"
              guidance="A rough proxy for daily engagement — enrollments whose progress was touched in the last 24 hours, broken down by track. Not a precise unique-login count."
              icon={<ActivityIcon />}
              visual={
                overview.totalTrainees > 0 ? (
                  <MiniProgressBar value={(overview.activeTraineesToday / overview.totalTrainees) * 100} />
                ) : undefined
              }
            >
              <EngagementBreakdown metric="activeToday" programmeId={programmeId} />
            </MetricTile>

            <MetricTile
              label="New enrollments"
              value={overview.newEnrollmentsThisWeek}
              hint="Last 7 days"
              title="New enrollments"
              subtitle="Last 7 days, by track"
              guidance="New enrollments recorded in the last 7 days. A flat or declining trend here despite a growing trainee pool may mean outreach or course discovery has stalled in a particular track."
              icon={<UserPlusIcon />}
              visual={
                overview.totalTrainees > 0 ? (
                  <MiniProgressBar value={(overview.newEnrollmentsThisWeek / overview.totalTrainees) * 100} />
                ) : undefined
              }
            >
              <EngagementBreakdown metric="newEnrollments" programmeId={programmeId} />
            </MetricTile>

            <MetricTile
              label="Quiz attempts"
              value={overview.quizAttemptsThisWeek}
              hint="Last 7 days"
              title="Quiz attempts"
              subtitle="Attempts and pass rate, by quiz"
              guidance="Quiz attempts and pass rates — a leading indicator of content difficulty or engagement quality, ahead of completion numbers catching up."
              wide
              icon={<ClipboardCheckIcon />}
              visual={<CountBadge text={`${overview.quizAttemptsThisWeek} this week`} />}
            >
              <QuizBreakdown programmeId={programmeId} />
            </MetricTile>

            <MetricTile
              label="Reports pending"
              value={overview.reportsPendingReview}
              hint="Awaiting MoITT review"
              title="Reports pending review"
              subtitle="Submitted by consortium partners"
              guidance="Consortium partner reports submitted but not yet reviewed by MoITT staff. Aim to keep this near zero to stay ahead of the reporting cycle."
              icon={<FileClockIcon />}
              visual={
                <CountBadge
                  text={overview.reportsPendingReview === 0 ? "All caught up" : "Needs review"}
                  tone={overview.reportsPendingReview === 0 ? "good" : "warn"}
                />
              }
            >
              <ReportsPendingList />
            </MetricTile>

            <MetricTile
              label="Open tasks"
              value={overview.kanbanOpenCards}
              hint="Across Kanban boards"
              title="Open tasks"
              subtitle="By assignee"
              guidance="Open Kanban tasks by assignee — use this to spot overloaded staff or work that's stalled before it becomes a bottleneck."
              icon={<ColumnsIcon />}
              visual={<MiniProgressBar value={kanbanThroughputPct} tone="warn" />}
            >
              <KanbanBreakdown metric="open" />
            </MetricTile>

            <MetricTile
              label="Tasks done"
              value={overview.kanbanDoneCards}
              hint="Across Kanban boards"
              title="Tasks done"
              subtitle="By assignee"
              guidance="Completed Kanban tasks by assignee — a quick read on team throughput."
              icon={<CheckSquareIcon />}
              visual={<MiniProgressBar value={kanbanThroughputPct} tone="good" />}
            >
              <KanbanBreakdown metric="done" />
            </MetricTile>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Where trainees are joining from" subtitle="Regional density across Pakistan, live" />
        <div className="p-4">
          <RegionMap data={regional} pulsingRegions={pulsingRegions} programmeId={programmeId} />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Enrollment by track" subtitle="Enrolled vs. completed, per track" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTrack} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="track" width={140} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="enrolled" fill="#c9ccdc" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completed" fill="#4a5fe0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Gender distribution" subtitle="Trainees by declared gender" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderSplit} dataKey="count" nameKey="gender" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {genderSplit.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Completion trend" subtitle="Completions per month, all tracks" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#4a5fe0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Enrollment by curriculum level" subtitle="Level 1 → 3, programme-wide" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLevel.map((d) => ({ ...d, label: LEVEL_LABELS[d.level] ?? d.level }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="enrolled" fill="#4a5fe0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Consortium partner performance" subtitle="Reported metrics, rolled up — programme-wide, not filtered by the selector above" />
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-2">Partner</th>
                  <th className="py-2">Enrolled</th>
                  <th className="py-2">Completed</th>
                  <th className="py-2">Dropouts</th>
                  <th className="py-2">Avg % female</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.partner} className="border-b border-slate-50">
                    <td className="py-2 font-medium">{p.partner}</td>
                    <td className="py-2">{p.enrolled}</td>
                    <td className="py-2">{p.completed}</td>
                    <td className="py-2">{p.dropouts}</td>
                    <td className="py-2">{p.avgFemalePct}%</td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No partner reports submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TraineeDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    api.get("/enrollments").then((r) => setEnrollments(r.data.enrollments));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Learning</h1>
        <p className="text-slate-500 text-sm mt-1">Track your progress across enrolled courses.</p>
      </div>
      <Card>
        <CardHeader title="My courses" />
        <div className="p-4 space-y-3">
          {enrollments.map((e) => {
            const course = typeof e.courseId === "string" ? null : e.courseId;
            return (
              <div key={e._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{course?.title ?? "Course"}</div>
                  <div className="text-xs text-slate-400">{e.status}</div>
                </div>
                <div className="w-40">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${e.progress}%` }} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 text-right">{e.progress}%</div>
                </div>
              </div>
            );
          })}
          {enrollments.length === 0 && <p className="text-slate-400 text-sm">No enrollments yet — browse Tracks & Courses.</p>}
        </div>
      </Card>
    </div>
  );
}
