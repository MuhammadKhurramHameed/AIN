// Lightweight recreation of the AIN (Artificial Intelligence Network) ribbon mark — an
// abstract interlocked-peaks glyph in the brand's blue -> purple -> green gradient, kept
// simple and bold so it stays legible at favicon size as well as in the sidebar header.
export function AinLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  const gradId = "ain-logo-gradient";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="2" y1="30" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#9333ea" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path
        d="M4 32L12 9L20 32L28 9L36 32"
        stroke={`url(#${gradId})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
