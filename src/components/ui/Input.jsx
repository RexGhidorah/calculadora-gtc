import { T } from "../../utils/theme";

export function Input({ dark, label, ...props }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 5 }}>{label}</label>
      <input
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8,
          background: T.inputBg(dark), border: `1.5px solid ${T.border2(dark)}`,
          color: T.t0(dark), fontSize: 13, transition: "border-color .15s",
        }}
        {...props}
      />
    </div>
  );
}
