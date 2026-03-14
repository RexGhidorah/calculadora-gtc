import { T } from "../../utils/theme";

export function Footer({ dark }) {
  return (
    <footer style={{ borderTop: `1px solid ${T.border(dark)}`, padding: "16px 32px", textAlign: "center", marginTop: 16 }}>
      <p style={{ fontSize: 11, color: T.t2(dark) }}>© 2026 GRUPO TORRES CORZO S.A. de C.V. · Nissan Mexicana Fleet Management System · Confidencial</p>
    </footer>
  );
}
