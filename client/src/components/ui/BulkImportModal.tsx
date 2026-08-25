import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { parseCsvToObjects } from "../../lib/csv";

export interface BulkImportResultRow {
  row: number;
  status: "created" | "skipped";
  reason?: string;
  email?: string;
  tempPassword?: string;
}

export interface BulkImportSummary {
  results: BulkImportResultRow[];
  created: number;
  skipped: number;
}

function downloadText(filename: string, text: string, mime = "text/csv") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BulkImportModal({
  title,
  description,
  templateFilename,
  templateCsv,
  onImport,
  onClose,
  onImported,
}: {
  title: string;
  description: string;
  templateFilename: string;
  templateCsv: string;
  onImport: (rows: Record<string, string>[]) => Promise<BulkImportSummary>;
  onClose: () => void;
  onImported: () => void;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSummary(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsvToObjects(String(reader.result));
        if (parsed.length === 0) {
          setError("No data rows found in this file.");
          setRows([]);
          return;
        }
        setRows(parsed);
      } catch {
        setError("Could not parse this file as CSV.");
        setRows([]);
      }
    };
    reader.readAsText(file);
  }

  async function runImport() {
    setImporting(true);
    setError(null);
    try {
      const result = await onImport(rows);
      setSummary(result);
      if (result.created > 0) onImported();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} wide>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <button
        type="button"
        className="text-sm text-brand-600 hover:underline mb-4"
        onClick={() => downloadText(templateFilename, templateCsv)}
      >
        Download CSV template
      </button>

      {!summary && (
        <div className="space-y-3">
          <input type="file" accept=".csv,text/csv" onChange={onFileChange} className="block text-sm" />
          {fileName && rows.length > 0 && (
            <p className="text-sm text-slate-600">
              {fileName} — {rows.length} row{rows.length === 1 ? "" : "s"} ready to import.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="button" onClick={runImport} disabled={rows.length === 0 || importing}>
            {importing ? "Importing..." : `Import ${rows.length || ""} row${rows.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      )}

      {summary && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-800">
            {summary.created} created, {summary.skipped} skipped.
          </p>
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {summary.results.map((r) => (
                  <tr key={r.row} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 tabular-nums">{r.row}</td>
                    <td className={`px-3 py-1.5 font-medium ${r.status === "created" ? "text-emerald-600" : "text-red-600"}`}>
                      {r.status}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {r.reason ?? (r.tempPassword ? `${r.email} — temp password: ${r.tempPassword}` : r.email ?? "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary.results.some((r) => r.tempPassword) && (
            <p className="text-xs text-amber-600">
              Copy down the generated temporary passwords now — they aren't stored anywhere retrievable after you close
              this dialog.
            </p>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
