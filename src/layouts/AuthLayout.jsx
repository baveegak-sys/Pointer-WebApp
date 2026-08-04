import "../css/auth.css";

/**
 * Shared shell for /login and /signup.
 * Left: brand / instrument panel (hidden on small screens).
 * Right: the form itself, passed in as children.
 */
const stats = [
  { value: "256-bit", label: "Encryption" },
  { value: "<40ms", label: "Auth latency" },
  { value: "99.98%", label: "Uptime" },
];

export default function AuthLayout({ children, eyebrow = "Secure access", title, tagline }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-grid-overlay" />
        <div className="auth-scanline" />

        <div className="relative z-10">
          <div className="auth-eyebrow">{eyebrow}</div>
          <h1 className="auth-wordmark mt-3">{title}</h1>
          <p className="auth-tagline mt-4">{tagline}</p>
        </div>

        <div className="auth-stat-strip relative z-10">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="auth-stat-value">{s.value}</div>
              <div className="auth-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </aside>

      <div className="auth-form-side">{children}</div>
    </div>
  );
}
