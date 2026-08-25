import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card, CardHeader } from "../components/ui/Card";

interface CertificateRow {
  _id: string;
  verificationCode: string;
  issuedAt: string;
  courseId: { title: string } | string;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);

  useEffect(() => {
    api.get("/certificates/mine").then((r) => setCertificates(r.data.certificates));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">Issued automatically when a course reaches 100% progress.</p>
      </div>
      <Card>
        <CardHeader title="Certificates" />
        <div className="divide-y divide-slate-50">
          {certificates.map((c) => {
            const course = typeof c.courseId === "string" ? null : c.courseId;
            return (
              <div key={c._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{course?.title ?? "Course"}</div>
                  <div className="text-xs text-slate-400">Issued {new Date(c.issuedAt).toLocaleDateString()}</div>
                </div>
                <a href={`/verify/${c.verificationCode}`} className="text-xs text-brand-600 hover:underline">
                  Verification link
                </a>
              </div>
            );
          })}
          {certificates.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No certificates yet.</div>}
        </div>
      </Card>
    </div>
  );
}
