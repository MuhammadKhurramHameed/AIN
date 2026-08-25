export function ExportLink({ href, children = "Export CSV" }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} className="px-3.5 py-2 rounded-lg text-sm font-medium transition bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
      {children}
    </a>
  );
}
