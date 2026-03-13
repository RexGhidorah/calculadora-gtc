import { T } from "../../utils/theme";

export function MetricCard({ dark, label, value, sub }) {
  return (
    <div style={{ background: T.cardBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 14, padding: "20px 22px", boxShadow: dark ? "0 2px 16px rgba(0,0,0,.3)" : "0 2px 12px rgba(0,0,0,.06)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: T.t0(dark), letterSpacing: ".02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: T.t1(dark), marginTop: 5 }}>{sub}</p>}
    </div>
  );
}
