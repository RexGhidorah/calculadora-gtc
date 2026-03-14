import { T } from "../../utils/theme";

export function Header({ dark, setDark }) {
  const flex = { display: "flex" };
  return (
    <header className="header-padding" style={{
      ...flex, alignItems: "center", justifyContent: "space-between", height: 60,
      background: T.headerBg(dark), borderBottom: `1px solid ${T.border(dark)}`,
      position: "sticky", top: 0, zIndex: 100, transition: "background .25s",
      boxShadow: dark ? "0 2px 20px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.06)",
    }}>
      <div style={{ ...flex, alignItems: "center", gap: 12 }}>
        <svg width="36" height="36" viewBox="0 0 116 116" xmlns="http://www.w3.org/2000/svg">
          <path fill="#e10e18" d="M 109.53 3.84 C 112.27 9.14 114.86 14.90 114.26 21.01 C 112.88 34.32 102.54 45.73 90.11 50.01 C 85.00 52.03 79.20 53.12 75.27 57.27 C 71.33 60.91 69.35 66.08 68.50 71.27 C 66.05 84.90 62.99 98.42 60.67 112.06 C 60.13 96.36 60.62 80.64 60.46 64.93 C 60.15 58.74 63.06 52.69 67.51 48.49 C 78.16 40.05 89.81 31.06 94.42 17.72 C 95.74 14.19 95.39 10.38 95.55 6.69 C 98.60 13.03 99.56 20.27 98.02 27.15 C 96.61 32.66 93.56 37.56 90.35 42.18 C 97.41 37.75 104.18 32.26 107.77 24.54 C 110.97 18.18 111.30 10.67 109.53 3.84 Z" />
          <path fill="#e10e18" d="M 2.15 23.91 C 0.50 17.31 3.05 10.76 5.51 4.73 C 5.57 10.02 4.71 15.51 6.58 20.61 C 9.58 29.89 17.02 36.92 25.18 41.84 C 21.20 35.56 16.99 28.77 17.28 21.03 C 16.78 15.99 18.45 11.20 20.43 6.66 C 19.17 17.67 25.44 27.63 32.94 35.06 C 36.98 39.39 41.64 43.05 46.34 46.63 C 52.28 51.09 56.12 58.47 55.48 65.98 C 55.14 80.19 56.06 94.44 55.05 108.62 C 52.35 99.28 51.12 89.60 49.09 80.11 C 47.45 72.65 47.22 64.19 41.73 58.29 C 35.34 51.12 24.75 51.12 17.19 45.71 C 10.02 40.35 3.71 32.97 2.15 23.91 Z" />
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: T.t0(dark), letterSpacing: "-.01em" }}>GRUPO TORRES CORZO</div>
          <div className="hide-on-mobile" style={{ fontSize: 10, fontWeight: 600, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".1em" }}>División de Flotas</div>
        </div>
      </div>

      <nav className="hide-on-mobile" style={{ ...flex, gap: 24 }}>
        {["Calculadora"].map(n => (
          <a key={n} href="#" style={{ fontSize: 13, fontWeight: 600, color: n === "Calculadora" ? "#CC0000" : T.t1(dark), textDecoration: "none" }}>{n}</a>
        ))}
      </nav>

      <div style={{ ...flex, alignItems: "center", gap: 12 }}>
        <label className="theme-switch" title={dark ? "Modo Claro" : "Modo Oscuro"}>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          <span className="theme-slider"></span>
        </label>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#CC0000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>EV</span>
        </div>
      </div>
    </header>
  );
}
