import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { AinLogo } from "../components/ui/AinLogo";

interface CertificateDetail {
  verificationCode: string;
  issuedAt: string;
  userId: { name: string };
  courseId: { title: string };
}

export default function VerifyCertificate() {
  const { code } = useParams<{ code: string }>();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/certificates/verify/${code}`)
      .then((r) => setCertificate(r.data.certificate))
      .catch((err) => setError(err.message));
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AinLogo size={26} />
          <div className="text-lg font-semibold">AIN — Certificate Verification</div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {certificate && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">This certifies that</p>
            <p className="text-xl font-semibold">{certificate.userId.name}</p>
            <p className="text-sm text-slate-500">has completed</p>
            <p className="text-lg font-medium">{certificate.courseId.title}</p>
            <p className="text-xs text-slate-400 mt-4">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            <p className="text-xs text-slate-300 font-mono mt-1">{certificate.verificationCode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
