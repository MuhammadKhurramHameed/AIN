import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { Modal } from "../ui/Modal";
import { MAP_VIEW_BOX, REGION_SHAPES, lerpColor } from "./regionMapData";

interface RegionDensity {
  region: string;
  trainees: number;
}

interface RegionDetail {
  region: string;
  trainees: number;
  femalePct: number;
  completionRate: number;
  byTrack: { track: string; trainees: number; completionRate: number }[];
}

const GUIDANCE = {
  density:
    "Trainee density shows where demand is concentrated. A region far below its population share may need targeted local-language outreach to meet nationwide-coverage commitments.",
  completion:
    "Completion rate is the share of enrollments that reached 100% progress. Sustained rates below ~40% often signal a need for tutor support, pacing changes, or connectivity barriers worth investigating.",
  gender:
    "Female participation below the programme's 30% target in a specific region is a compliance risk worth flagging to the M&E team ahead of the next reporting cycle.",
  trackMix:
    "A region concentrated in one or two tracks may mean outreach isn't reaching other participant categories evenly (e.g. public sector staff, entrepreneurs, freelancers).",
};

function densityColor(value: number, max: number): string {
  const t = max > 0 ? value / max : 0;
  return lerpColor("#dbe0fb", "#31419e", Math.min(1, t));
}

export function RegionMap({
  data,
  pulsingRegions,
  programmeId,
}: {
  data: RegionDensity[];
  pulsingRegions: Set<string>;
  programmeId?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RegionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const maxTrainees = useMemo(() => Math.max(0, ...data.map((d) => d.trainees)), [data]);
  const byRegion = useMemo(() => new Map(data.map((d) => [d.region, d.trainees])), [data]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    const params = new URLSearchParams({ region: selected });
    if (programmeId) params.set("programmeId", programmeId);
    api
      .get(`/dashboard/regional-detail?${params.toString()}`)
      .then((r) => setDetail(r.data))
      .finally(() => setLoadingDetail(false));
  }, [selected, programmeId]);

  function toggle(region: string) {
    setSelected((prev) => (prev === region ? null : region));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-xs text-slate-400">Shading shows trainee density. Click a province to expand its detail.</p>
        <button onClick={() => setShowGuide((v) => !v)} className="text-xs text-brand-600 hover:underline shrink-0">
          {showGuide ? "Hide guidance" : "How to read this"}
        </button>
      </div>

      {showGuide && (
        <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 mb-3 space-y-1.5">
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Density — </span>
            {GUIDANCE.density}
          </p>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Completion — </span>
            {GUIDANCE.completion}
          </p>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Gender — </span>
            {GUIDANCE.gender}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <svg viewBox={MAP_VIEW_BOX} className="w-full max-w-[320px] mx-auto md:mx-0 shrink-0">
          {Object.entries(REGION_SHAPES).map(([region, shape]) => {
            const trainees = byRegion.get(region) ?? 0;
            const pulsing = pulsingRegions.has(region);
            const isSelected = selected === region;
            return (
              <g key={region} onClick={() => toggle(region)} className="cursor-pointer">
                <path
                  d={shape.path}
                  fill={densityColor(trainees, maxTrainees)}
                  stroke={isSelected ? "#31419e" : "#ffffff"}
                  strokeWidth={isSelected ? 2.5 : 1}
                  strokeLinejoin="round"
                />
                {pulsing && (
                  <circle
                    cx={shape.centroid[0]}
                    cy={shape.centroid[1]}
                    r={10}
                    fill="none"
                    stroke="#0e7a63"
                    strokeWidth={2.5}
                    className="animate-ping"
                    opacity={0.7}
                  />
                )}
                <circle cx={shape.centroid[0]} cy={shape.centroid[1]} r={2.5} fill="#31419e" opacity={0.7} />
              </g>
            );
          })}
        </svg>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-2">
            {data.map((d) => (
              <button
                key={d.region}
                onClick={() => toggle(d.region)}
                className="text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-brand-300 hover:bg-brand-50 transition"
              >
                <div className="text-xs text-slate-400">{d.region}</div>
                <div className="text-lg font-semibold text-slate-900 tabular-nums">{d.trainees.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <Modal title={selected} subtitle="Regional breakdown" onClose={() => setSelected(null)} wide>
          {loadingDetail && <div className="text-sm text-slate-400">Loading regional breakdown...</div>}
          {!loadingDetail && detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-400">Trainees</div>
                  <div className="text-lg font-semibold tabular-nums">{detail.trainees.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Completion rate</div>
                  <div className="text-lg font-semibold tabular-nums">{detail.completionRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Female participation</div>
                  <div className="text-lg font-semibold tabular-nums">{detail.femalePct}%</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">By track</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="py-1.5 font-medium">Track</th>
                      <th className="py-1.5 font-medium">Trainees</th>
                      <th className="py-1.5 font-medium">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.byTrack.map((row) => (
                      <tr key={row.track} className="border-b border-slate-50">
                        <td className="py-1.5">{row.track}</td>
                        <td className="py-1.5 tabular-nums">{row.trainees}</td>
                        <td className="py-1.5 tabular-nums">{row.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 mt-2">{GUIDANCE.trackMix}</p>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
