import { T } from "../../utils/theme";

export function SectionCard({ dark, icon, title, children, style = {} }) {
  return (
    <div style={{
      background: T.cardBg(dark), border: `1px solid ${T.border(dark)}`,
      borderRadius: 14, padding: "22px 24px", boxShadow: dark ? "0 2px 16px rgba(0,0,0,.3)" : "0 2px 12px rgba(0,0,0,.06)",
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 16, marginBottom: 20, borderBottom: `1px solid ${T.border(dark)}` }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: T.t0(dark) }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
