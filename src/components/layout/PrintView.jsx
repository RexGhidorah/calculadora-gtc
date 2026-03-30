import { useMemo } from "react";
import { mxn, pct } from "../../utils/formatters";
import { LogoGTC, LogoNissan } from "../icons/Icons";

export function PrintView({ r, m, safeNum, cliente, modeloSeleccionado, safePlazo, catV, comisiones, gastosOpExt, costoClienteExtra }) {
  const printTableRows = useMemo(() => {
    if (!r) return [];
    let rows = [];
    rows.push(["Precio Final c/IVA", mxn(r.pSIVA * 1.16), mxn(r.pSIVA * 1.16 * safeNum), false, false]);
    if (costoClienteExtra > 0) {
      rows.push(["Costo Cliente Extra", mxn(costoClienteExtra), mxn(costoClienteExtra * safeNum), false, false]);
    }
    rows.push(["IVA (16%)", mxn(r.iva), mxn(r.iva * safeNum), false, false]);
    rows.push(["Precio s/IVA", mxn(r.pSIVA), mxn(r.pSIVA * safeNum), false, false]);
    rows.push(["Costo Distribuidor", `(${mxn(m.dist)})`, `(${mxn(m.dist * safeNum)})`, false, false]);

    rows.push(["Cargos Extras", `(${mxn(r.cargos)})`, `(${mxn(r.cargos * safeNum)})`, false, false]);
    if (m.cargosObj) {
      if (m.cargosObj.promo_pub) rows.push(["↳ Promoción y Pub.", `(${mxn(m.cargosObj.promo_pub)})`, `(${mxn(m.cargosObj.promo_pub * safeNum)})`, false, true]);
      if (m.cargosObj.prima_asist) rows.push(["↳ Prima Asistencia", `(${mxn(m.cargosObj.prima_asist)})`, `(${mxn(m.cargosObj.prima_asist * safeNum)})`, false, true]);
      if (m.cargosObj.cuota_tras) rows.push(["↳ Cuota Traslado", `(${mxn(m.cargosObj.cuota_tras)})`, `(${mxn(m.cargosObj.cuota_tras * safeNum)})`, false, true]);
      if (m.cargosObj.seg_tras) rows.push(["↳ Seguro Traslado", `(${mxn(m.cargosObj.seg_tras)})`, `(${mxn(m.cargosObj.seg_tras * safeNum)})`, false, true]);
    }

    let hasGastosValidos = false;
    gastosOpExt.forEach(g => { if ((parseFloat(g.valor) || 0) > 0) hasGastosValidos = true; });

    if (hasGastosValidos) {
      rows.push(["Gastos Operativos Ext.", `(${mxn(r.totalGastosOpExt)})`, `(${mxn(r.totalGastosOpExt * safeNum)})`, false, false]);
      gastosOpExt.forEach(g => {
        const v = parseFloat(g.valor) || 0;
        const pctCliente = Math.max(0, Math.min(100, parseFloat(g.porcentajeCliente) || 0));
        const absorbeAgencia = v * (1 - pctCliente / 100);
        if (v > 0) {
          const labelAdicional = pctCliente > 0 ? ` (C: ${pctCliente}%)` : '';
          rows.push([`↳ ${g.nombre || "Sin nombre"}${labelAdicional}`, `(${mxn(absorbeAgencia)})`, `(${mxn(absorbeAgencia * safeNum)})`, false, true]);
        }
      });
    }

    rows.push(["Cuotas", `(${mxn(r.cuotas)})`, `(${mxn(r.cuotas * safeNum)})`, false, false]);
    if (m.cuotasObj) {
      if (m.cuotasObj.amda) rows.push(["↳ Cuota AMDA", `(${mxn(m.cuotasObj.amda)})`, `(${mxn(m.cuotasObj.amda * safeNum)})`, false, true]);
      if (m.cuotasObj.andanac) rows.push(["↳ Cuota ANDANAC", `(${mxn(m.cuotasObj.andanac)})`, `(${mxn(m.cuotasObj.andanac * safeNum)})`, false, true]);
      if (m.cuotasObj.promei) rows.push(["↳ Cuota PROMEI", `(${mxn(m.cuotasObj.promei)})`, `(${mxn(m.cuotasObj.promei * safeNum)})`, false, true]);
      if (m.cuotasObj.seguro_pp) rows.push(["↳ Seguro Plan Piso", `(${mxn(m.cuotasObj.seguro_pp)})`, `(${mxn(m.cuotasObj.seguro_pp * safeNum)})`, false, true]);
      if (m.cuotasObj.ayuda_social) rows.push(["↳ Ayuda Social", `(${mxn(m.cuotasObj.ayuda_social)})`, `(${mxn(m.cuotasObj.ayuda_social * safeNum)})`, false, true]);
    }

    rows.push(["Incentivo NMEX", mxn(r.bonif.total), mxn(r.bonif.total * safeNum), false, false]);
    rows.push(["Utilidad Bruta", mxn(r.uB), mxn(r.uB * safeNum), false, false]);
    rows.push(["ISAN", `(${mxn(r.isan)})`, `(${mxn(r.isan * safeNum)})`, false, false]);
    rows.push(["Plan Piso", `(${mxn(r.pp)})`, `(${mxn(r.pp * safeNum)})`, false, false]);
    rows.push(["Eval. Corporativa", r.ec === 0 ? "—" : `(${mxn(r.ec)})`, r.ec === 0 ? "—" : `(${mxn(r.ec * safeNum)})`, false, false]);

    if (r.totalComisiones > 0) {
      rows.push(["Comisiones", `(${mxn(r.totalComisiones)})`, `(${mxn(r.totalComisiones * safeNum)})`, false, false]);
    }

    rows.push(["U. Operativa", mxn(r.uopU), mxn(r.uopT), true, false]);
    rows.push(["Margen", pct(r.mg), pct(r.mg), true, false]);

    return rows;
  }, [r, m, safeNum, gastosOpExt, costoClienteExtra]);

  if (!r) return null;

  return (
    <div className="print-only" style={{ padding: 0 }}>
      <div style={{ background: "white", width: "100%", minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", margin: "0 auto", color: "#1f2937", fontFamily: "sans-serif" }}>
        <div style={{ height: "8px", width: "100%", backgroundColor: "#e10e18" }}></div>

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
          <LogoNissan style={{ width: "450px", color: "#9ca3af", opacity: 0.06, transform: "rotate(-12deg)" }} />
        </div>

        <div style={{ padding: "20px 30px", flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1f2937", paddingBottom: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <LogoGTC />
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.025em", color: "#111827", lineHeight: 1, margin: 0 }}>GRUPO TORRES CORZO</h1>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "4px 0 0 0" }}>Resumen de Rentabilidad</p>
              </div>
            </div>
          </header>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px", marginBottom: "24px", backgroundColor: "#f9fafb", padding: "12px 16px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Cliente:</span> {cliente || "Sin especificar"}</p>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Modelo:</span> {modeloSeleccionado}</p>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Número de Unidades:</span> {safeNum}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Fecha de Emisión:</span> {new Date().toLocaleDateString('es-MX')}</p>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Plazo de Pago:</span> {safePlazo} días</p>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: "#111827" }}>Cat. de Venta / TIIE:</span> {catV} / {pct(r.tasa)}</p>
            </div>
          </section>

          <table style={{ width: "100%", fontSize: "13px", textAlign: "left", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #d1d5db" }}>
                <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1f2937", width: "50%" }}>Concepto</th>
                <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1f2937", textAlign: "right" }}>Unitario</th>
                <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1f2937", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: "1px solid #f3f4f6" }}>
              {printTableRows.map(([c, pu, tot, hl, isSub], i) => {
                const isBold = hl || !isSub;
                return (
                  <tr key={i} style={{ backgroundColor: hl ? "#fef2f2" : "transparent", color: hl ? "#e10e18" : (isSub ? "#6b7280" : "#111827"), fontWeight: isBold ? 600 : 400, borderTop: hl ? "1px solid #fee2e2" : "1px solid #f3f4f6", borderBottom: hl ? "1px solid #fee2e2" : "none", fontSize: isSub ? "11px" : "12px" }}>
                    <td style={{ padding: "4px 8px", paddingLeft: isSub ? "32px" : "8px" }}>{c}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}><span style={{ color: pu.includes('(') ? "#dc2626" : "inherit" }}>{pu}</span></td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}><span style={{ color: tot.includes('(') ? "#dc2626" : "inherit" }}>{tot}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <footer style={{ marginTop: "auto", paddingTop: "32px", width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "32px", textAlign: "center" }}>
              <div>
                <div style={{ borderBottom: "1px solid #9ca3af", margin: "0 16px 8px 16px", height: "40px" }}></div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", margin: 0 }}>{comisiones[0]?.nombre || 'Asesor Comercial'}</p>
              </div>
              <div>
                <div style={{ borderBottom: "1px solid #9ca3af", margin: "0 16px 8px 16px", height: "40px" }}></div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", margin: 0 }}>Gerente Comercial</p>
              </div>
              <div>
                <div style={{ borderBottom: "1px solid #9ca3af", margin: "0 16px 8px 16px", height: "40px" }}></div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", margin: 0 }}>Director Comercial</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", fontSize: "10px", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: "8px" }}>
              <p style={{ margin: 0 }}>calculadora-gtc | localhost:5173</p>
              <p style={{ margin: 0 }}>Página 1 de 1</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
