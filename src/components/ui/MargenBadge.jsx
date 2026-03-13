import { T } from "../../utils/theme";

export function MargenBadge({ dark, margen }) {
  const negativo = margen < 0;
  const bajo = margen >= 0 && margen <= 0.015;
  if (!negativo && !bajo) return null;

  const clr = negativo ? T.danger(dark) : T.amber(dark);
  const bg = negativo ? `${T.danger(dark)}14` : `${T.amber(dark)}14`;
  const brd = negativo ? `${T.danger(dark)}40` : `${T.amber(dark)}40`;
  const txt = negativo ? "⚠ Utilidad negativa — operación en pérdida" : "⚠ Margen ≤ 1.5% — revisar condiciones";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      background: bg, border: `1px solid ${brd}`, borderRadius: 8, marginTop: 10
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: clr }}>{txt}</span>
    </div>
  );
}
