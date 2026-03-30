import { useCalculator } from "./hooks/useCalculator";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { PrintView } from "./components/layout/PrintView";
import { Input } from "./components/ui/Input";
import { SectionCard } from "./components/ui/SectionCard";
import { MetricCard } from "./components/ui/MetricCard";
import { MargenBadge } from "./components/ui/MargenBadge";
import { T } from "./utils/theme";
import { mxn, pct } from "./utils/formatters";
import { TIIE_DEFAULT, ADIC_DEFAULT } from "./core/calculations";
import { GASTOS_OPERATIVOS_FLOTAS } from "./data/gastosOperativos";

export default function App() {
  const calc = useCalculator();
  const { state, actions, computed } = calc;
  const { dark, loadingDb, modelosData, vigenciaDB, cliente, num, plazo, bc, tiieInput, fechaTiieAplicada, adicInput, modeloSeleccionado, categoriaSeleccionada, precioNegociadoInput, isanOvr, expandCargos, expandGastosOpExt, expandCuotas, comisiones, gastosOpExt } = state;
  const { setDark, setCliente, setNum, setPlazo, setBC, setTiieInput, setAdicInput, setModeloSeleccionado, setCategoriaSeleccionada, setPrecioNegociadoInput, setIsanOvr, setExpandCargos, setExpandGastosOpExt, setExpandCuotas, setComisiones, setGastosOpExt, nextId } = actions;
  const { m, pF, esAAA, precioNegociado, descuentoAdicional, safeNum, safePlazo, totalComisiones, totalGastosOpExt, costoClienteExtra, r, descFijo, familiaModelo, gastosOpExtBloqueados } = computed;

  const catV = r ? r.categoria : "—";
  const ac = r ? (r.mg < 0 ? T.danger(dark) : r.mg <= 0.015 ? T.amber(dark) : T.t0(dark)) : T.t0(dark);
  const noData = !r;

  let webTableRows = [];
  if (r) {
    webTableRows.push(["Precio Final c/IVA", mxn(r.pSIVA * 1.16), mxn(r.pSIVA * 1.16 * safeNum)]);
    if (costoClienteExtra > 0) {
      webTableRows.push(["Costo Cliente Extra", mxn(costoClienteExtra), mxn(costoClienteExtra * safeNum), false, false, false, null, false, true]);
    }
    webTableRows.push(["IVA (16%)", mxn(r.iva), mxn(r.iva * safeNum)]);
    webTableRows.push(["Precio s/IVA", mxn(r.pSIVA), mxn(r.pSIVA * safeNum)]);
    webTableRows.push(["Costo Distribuidor", `(${mxn(m.dist)})`, `(${mxn(m.dist * safeNum)})`]);

    webTableRows.push([
      "Cargos Extras", `(${mxn(r.cargos)})`, `(${mxn(r.cargos * safeNum)})`,
      false, true, expandCargos, () => setExpandCargos(!expandCargos), false
    ]);

    if (expandCargos && m.cargosObj) {
      if (m.cargosObj.promo_pub) webTableRows.push(["↳ Promoción y Pub.", `(${mxn(m.cargosObj.promo_pub)})`, `(${mxn(m.cargosObj.promo_pub * safeNum)})`, false, false, false, null, true]);
      if (m.cargosObj.prima_asist) webTableRows.push(["↳ Prima Asistencia", `(${mxn(m.cargosObj.prima_asist)})`, `(${mxn(m.cargosObj.prima_asist * safeNum)})`, false, false, false, null, true]);
      if (m.cargosObj.cuota_tras) webTableRows.push(["↳ Cuota Traslado", `(${mxn(m.cargosObj.cuota_tras)})`, `(${mxn(m.cargosObj.cuota_tras * safeNum)})`, false, false, false, null, true]);
      if (m.cargosObj.seg_tras) webTableRows.push(["↳ Seguro Traslado", `(${mxn(m.cargosObj.seg_tras)})`, `(${mxn(m.cargosObj.seg_tras * safeNum)})`, false, false, false, null, true]);
    }

    if (r.totalGastosOpExt > 0) {
      webTableRows.push([
        "Gastos Operativos Ext.", `(${mxn(r.totalGastosOpExt)})`, `(${mxn(r.totalGastosOpExt * safeNum)})`,
        false, true, expandGastosOpExt, () => setExpandGastosOpExt(!expandGastosOpExt), false
      ]);

      if (expandGastosOpExt) {
        gastosOpExt.forEach(g => {
          const v = parseFloat(g.valor) || 0;
          if (v > 0) {
            const pctLabel = g.porcentajeCliente > 0 ? ` (C: ${g.porcentajeCliente}%)` : "";
            webTableRows.push([`↳ ${g.nombre || "Sin nombre"}${pctLabel}`, `(${mxn(v)})`, `(${mxn(v * safeNum)})`, false, false, false, null, true]);
          }
        });
      }
    }

    webTableRows.push([
      "Cuotas", `(${mxn(r.cuotas)})`, `(${mxn(r.cuotas * safeNum)})`,
      false, true, expandCuotas, () => setExpandCuotas(!expandCuotas), false
    ]);

    if (expandCuotas && m.cuotasObj) {
      if (m.cuotasObj.amda) webTableRows.push(["↳ Cuota AMDA", `(${mxn(m.cuotasObj.amda)})`, `(${mxn(m.cuotasObj.amda * safeNum)})`, false, false, false, null, true]);
      if (m.cuotasObj.andanac) webTableRows.push(["↳ Cuota ANDANAC", `(${mxn(m.cuotasObj.andanac)})`, `(${mxn(m.cuotasObj.andanac * safeNum)})`, false, false, false, null, true]);
      if (m.cuotasObj.promei) webTableRows.push(["↳ Cuota PROMEI", `(${mxn(m.cuotasObj.promei)})`, `(${mxn(m.cuotasObj.promei * safeNum)})`, false, false, false, null, true]);
      if (m.cuotasObj.seguro_pp) webTableRows.push(["↳ Seguro Plan Piso", `(${mxn(m.cuotasObj.seguro_pp)})`, `(${mxn(m.cuotasObj.seguro_pp * safeNum)})`, false, false, false, null, true]);
      if (m.cuotasObj.ayuda_social) webTableRows.push(["↳ Ayuda Social", `(${mxn(m.cuotasObj.ayuda_social)})`, `(${mxn(m.cuotasObj.ayuda_social * safeNum)})`, false, false, false, null, true]);
    }

    webTableRows.push(["Incentivo NMEX", mxn(r.bonif.total), mxn(r.bonif.total * safeNum)]);
    webTableRows.push(["Utilidad Bruta", mxn(r.uB), mxn(r.uB * safeNum)]);
    webTableRows.push(["ISAN", `(${mxn(r.isan)})`, `(${mxn(r.isan * safeNum)})`]);
    webTableRows.push(["Plan Piso", `(${mxn(r.pp)})`, `(${mxn(r.pp * safeNum)})`]);
    webTableRows.push(["Eval. Corporativa", r.ec === 0 ? "—" : `(${mxn(r.ec)})`, r.ec === 0 ? "—" : `(${mxn(r.ec * safeNum)})`]);

    if (r.totalComisiones > 0) {
      webTableRows.push(["Comisiones", `(${mxn(r.totalComisiones)})`, `(${mxn(r.totalComisiones * safeNum)})`]);
    }

    webTableRows.push(["U. Operativa", mxn(r.uopU), mxn(r.uopT), true]);
    webTableRows.push(["Margen", pct(r.mg), pct(r.mg), true]);
  }

  const flex = { display: "flex" };
  const col = { flexDirection: "column" };
  const handlePrint = () => window.print();

  return (
    <>
      <div className="no-print" style={{ minHeight: "100vh", background: T.pageBg(dark), transition: "background .25s" }}>
        <Header dark={dark} setDark={setDark} />

        <main className="main-padding" style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 className="title-responsive" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: ".04em", color: T.t0(dark), lineHeight: 1 }}>Calculadora de Rentabilidad</h1>
            <p style={{ fontSize: 13, color: T.t1(dark), marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: loadingDb ? T.amber(dark) : T.green(dark) }}></span>
              {vigenciaDB}
            </p>
          </div>

          <div className="layout-main">
            <div style={{ ...flex, ...col, gap: 20 }}>
              <SectionCard dark={dark} icon="👤" title="Información del Cliente">
                <div className="grid-resp-2">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Input dark={dark} label="Nombre de la Empresa" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej. Logística Global S.A." type="text" />
                  </div>
                  <Input dark={dark} label="Número de Unidades" value={num} onChange={e => setNum(e.target.value)} type="number" min={1} max={500} />
                  <Input dark={dark} label="Plazo de Pago (Días)" value={plazo} onChange={e => setPlazo(e.target.value)} type="number" min={0} max={180} />
                </div>
                <div style={{ ...flex, justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border(dark)}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.t0(dark) }}>Business Case (BC)</div>
                    <div style={{ fontSize: 12, color: T.t1(dark), marginTop: 2 }}>
                      {bc ? "Activo — Evaluación corporativa exenta" : "Sin BC — aplica cargo de evaluación"}
                    </div>
                  </div>
                  <button onClick={() => setBC(n => !n)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: bc ? "#CC0000" : T.t3(dark), position: "relative", transition: "background .2s", flexShrink: 0, boxShadow: bc ? "0 0 12px rgba(204,0,0,.4)" : "none" }}>
                    <div style={{ position: "absolute", top: 3, left: bc ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
                  </button>
                </div>
              </SectionCard>

              <SectionCard dark={dark} icon="🚗" title="Selección de Modelo y Precios">
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Modelo / Versión</label>
                  <select value={modeloSeleccionado} disabled={loadingDb} onChange={e => {
                    setModeloSeleccionado(e.target.value);
                    setCategoriaSeleccionada("MENUDEO");
                    setIsanOvr("");
                    setPrecioNegociadoInput("");
                    setGastosOpExt([]);
                  }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, backgroundColor: T.inputBg(dark), border: `1.5px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 13, cursor: loadingDb ? "wait" : "pointer", appearance: "none", opacity: loadingDb ? 0.6 : 1, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                    <option value="">{loadingDb ? "Cargando catálogo..." : "— Seleccionar modelo —"}</option>
                    {modelosData.map(x => <option key={x.id} value={x.modelo}>{x.modelo}</option>)}
                  </select>
                </div>
                {m && (
                  <div className="grid-resp-3">
                    {[
                      ["Precio Lista", mxn(m.lista), T.t0(dark)],
                      ["Precio Especial", m.especial ? mxn(m.especial) : "—", T.t1(dark)],
                      ["Bono del Mes", m.bonoMes ? mxn(m.bonoMes) : "$0", m.bonoMes ? T.green(dark) : T.t2(dark)],
                      ["Precio A", mxn(m.flotA), T.t0(dark)],
                      ["Precio AA", mxn(m.flotAA), T.t0(dark)],
                      ["Precio AAA", mxn(m.flotAAA), T.t0(dark)],
                      ["Incentivo A", mxn(m.incA), T.t0(dark)],
                      ["Incentivo AA/AAA", mxn(m.incAA), T.t0(dark)],
                      ["Costo Dist.", mxn(m.dist), T.t1(dark)],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{label}</p>
                        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color, letterSpacing: ".02em" }}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {m && (
                <SectionCard dark={dark} icon="📊" title="Condiciones de Venta Final y Rentabilidad">
                  <div className="grid-resp-3" style={{ marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Precio Final c/IVA</label>
                      <input type="text" value={m ? mxn(pF) : ""} readOnly style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, color: T.t1(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: "not-allowed", opacity: 0.8 }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Descuento Base (%)</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" readOnly value={m ? (descFijo * 100).toFixed(2) : ""} style={{ width: "100%", padding: "9px 12px", paddingRight: 28, borderRadius: 8, background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, color: T.t1(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: "not-allowed", opacity: 0.8 }} />
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Cat. de Venta</label>
                      <select value={categoriaSeleccionada} onChange={e => { setCategoriaSeleccionada(e.target.value); setPrecioNegociadoInput(""); }} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textAlign: "center", background: categoriaSeleccionada === "AAA" ? "rgba(204,0,0,.12)" : categoriaSeleccionada === "AA" ? "rgba(168,85,247,.12)" : categoriaSeleccionada === "A" ? "rgba(59,130,246,.12)" : T.inputBg(dark), border: `1.5px solid ${categoriaSeleccionada === "AAA" ? "#CC000044" : categoriaSeleccionada === "AA" ? "#a855f744" : categoriaSeleccionada === "A" ? "#3b82f644" : T.border(dark)}`, color: categoriaSeleccionada === "AAA" ? "#CC0000" : categoriaSeleccionada === "AA" ? (dark ? "#c084fc" : "#7c3aed") : categoriaSeleccionada === "A" ? (dark ? "#60a5fa" : "#1d4ed8") : T.t1(dark), cursor: "pointer", appearance: "none" }}>
                        <option value="MENUDEO">MENUDEO (0%)</option>
                        <option value="A">A (3%)</option>
                        <option value="AA">AA (5%)</option>
                        <option value="AAA">AAA (7%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-resp-2" style={{ marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Precio Negociado c/IVA {categoriaSeleccionada !== "AAA" && <span style={{ fontSize: 10, fontWeight: 400 }}>(Requiere Cat. AAA)</span>}</label>
                      <input type="number" value={esAAA ? precioNegociadoInput : ""} onChange={e => setPrecioNegociadoInput(e.target.value)} disabled={!esAAA} placeholder={esAAA ? pF.toFixed(0) : "Bloqueado"} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: esAAA ? T.inputBg(dark) : (dark ? "#16181f" : "#e2e8f0"), border: `2px solid ${esAAA ? "#CC0000" : T.border(dark)}`, color: T.t0(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: esAAA ? "text" : "not-allowed", opacity: esAAA ? 1 : 0.6, transition: "all .2s" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Descuento Adicional (%)</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" readOnly value={esAAA && precioNegociadoInput !== "" ? (descuentoAdicional * 100).toFixed(2) : "0.00"} style={{ width: "100%", padding: "9px 12px", paddingRight: 28, borderRadius: 8, background: esAAA ? T.inputBg(dark) : (dark ? "#16181f" : "#e2e8f0"), border: `2px solid ${esAAA && descuentoAdicional > 0 ? T.amber(dark) : (esAAA ? T.border2(dark) : T.border(dark))}`, color: esAAA && descuentoAdicional > 0 ? T.amber(dark) : T.t0(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: "not-allowed", opacity: esAAA ? 1 : 0.6, transition: "all .2s" }} />
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                      </div>
                    </div>
                  </div>

                  {r && (
                    <div className="grid-resp-2" style={{ gap: 8, marginBottom: 20, padding: "12px 14px", background: `${T.green(dark)}0e`, border: `1px solid ${T.green(dark)}25`, borderRadius: 10 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Incentivo {r.categoria} (por unidad)</p>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: T.green(dark) }}>{mxn(r.bonif.total)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Total Bonif. NMEX ({safeNum} uds.)</p>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: T.green(dark) }}>{mxn(r.bonif.total * safeNum)}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 20, padding: "16px", background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 12, opacity: gastosOpExtBloqueados ? 0.6 : 1, pointerEvents: gastosOpExtBloqueados ? "none" : "auto" }}>
                    <div style={{ ...flex, justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em" }}>Gastos Operativos Ext.</p>
                      <div style={{ ...flex, alignItems: "center", gap: 8 }}>
                        {totalGastosOpExt > 0 && !gastosOpExtBloqueados && r && <span className="hide-on-mobile" style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: T.danger(dark) }}>Total: ({mxn(totalGastosOpExt)})</span>}
                        {!gastosOpExtBloqueados && <button onClick={() => setGastosOpExt(gs => [...gs, { id: nextId(), nombre: "", valor: "", porcentajeCliente: 0 }])} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border2(dark)}`, background: "transparent", color: T.t1(dark), fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Agregar</button>}
                      </div>
                    </div>
                    {gastosOpExtBloqueados ? (
                      <p style={{ fontSize: 12, color: T.t2(dark), textAlign: "center", padding: "8px 0" }}>Opción bloqueada para este modelo.</p>
                    ) : gastosOpExt.length === 0 ? (
                      <p style={{ fontSize: 12, color: T.t2(dark), textAlign: "center", padding: "8px 0" }}>Sin gastos operativos extra</p>
                    ) : (
                      <div style={{ ...flex, ...col, gap: 12 }}>
                        {gastosOpExt.map((g) => {
                          const opcionesDisponibles = familiaModelo ? Object.keys(GASTOS_OPERATIVOS_FLOTAS[familiaModelo] || {}).filter(opt => opt !== "INSTALACION DE CAJAS SECAS" || familiaModelo === "NP300") : [];
                          return (
                            <div key={g.id} className="commission-row" style={{ flexWrap: "wrap", gap: 10 }}>
                              <select value={g.nombre} onChange={e => {
                                const nuevoNombre = e.target.value;
                                let nuevoValor = g.valor;
                                if (nuevoNombre === "") {
                                  nuevoValor = "";
                                } else if (familiaModelo && GASTOS_OPERATIVOS_FLOTAS[familiaModelo][nuevoNombre] !== undefined) {
                                  nuevoValor = GASTOS_OPERATIVOS_FLOTAS[familiaModelo][nuevoNombre];
                                }
                                setGastosOpExt(gs => gs.map(x => x.id === g.id ? { ...x, nombre: nuevoNombre, valor: nuevoValor } : x));
                              }} style={{ flex: 2, minWidth: 120, padding: "7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12 }}>
                                <option value="">— Seleccionar concepto —</option>
                                {opcionesDisponibles.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <div style={{ flex: 1, minWidth: 90, position: "relative" }} title="Costo">
                                <input type="number" readOnly placeholder="0" value={g.valor} style={{ width: "100%", padding: "7px 28px 7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12, fontFamily: "'JetBrains Mono',monospace", cursor: "not-allowed", opacity: 0.8 }} />
                                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.t2(dark), pointerEvents: "none" }}>$</span>
                              </div>
                              <div style={{ width: 80, position: "relative" }} title="Absorbe Cliente (%)">
                                <input type="number" placeholder="0" min="0" max="100" value={g.porcentajeCliente !== undefined ? g.porcentajeCliente : ""} onChange={e => setGastosOpExt(gs => gs.map(x => x.id === g.id ? { ...x, porcentajeCliente: e.target.value } : x))} style={{ width: "100%", padding: "7px 20px 7px 8px", borderRadius: 7, background: T.inputBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }} />
                                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.t2(dark), pointerEvents: "none", fontWeight: 700 }}>%</span>
                              </div>
                              <button onClick={() => setGastosOpExt(gs => gs.filter(x => x.id !== g.id))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border(dark)}`, background: "transparent", color: T.t2(dark), fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 20, padding: "16px", background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 12 }}>
                    <div style={{ ...flex, justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em" }}>Comisiones</p>
                      <div style={{ ...flex, alignItems: "center", gap: 8 }}>
                        {totalComisiones > 0 && r && <span className="hide-on-mobile" style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: T.danger(dark) }}>Total: ({mxn(totalComisiones)})</span>}
                        <button onClick={() => setComisiones(cs => [...cs, { id: nextId(), nombre: "", valor: "", modo: "pct" }])} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border2(dark)}`, background: "transparent", color: T.t1(dark), fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Agregar</button>
                      </div>
                    </div>
                    {comisiones.length === 0 && <p style={{ fontSize: 12, color: T.t2(dark), textAlign: "center", padding: "8px 0" }}>Sin comisiones registradas</p>}
                    <div style={{ ...flex, ...col, gap: 12 }}>
                      {comisiones.map((c) => {
                        const valNum = parseFloat(c.valor) || 0;
                        const uBase = r ? r.uopU_bruta : 0;
                        const enMXN = c.modo === "pct" ? uBase * (valNum / 100) : valNum;
                        const enPct = c.modo === "mxn" ? (uBase > 0 ? (valNum / uBase) * 100 : 0) : valNum;
                        return (
                          <div key={c.id} className="commission-row">
                            <input placeholder="Concepto (ej. Vendedor)" value={c.nombre} onChange={e => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, nombre: e.target.value } : x))} style={{ flex: 2, minWidth: 120, padding: "7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12 }} />
                            <div style={{ flex: 1, minWidth: 90, position: "relative" }}>
                              <input type="number" min={0} placeholder="0" value={c.valor} onChange={e => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, valor: e.target.value } : x))} style={{ width: "100%", padding: "7px 28px 7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }} />
                              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.t2(dark), pointerEvents: "none" }}>{c.modo === "pct" ? "%" : "$"}</span>
                            </div>
                            <button onClick={() => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, modo: x.modo === "pct" ? "mxn" : "pct", valor: "" } : x))} style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, background: dark ? "#2a2f3e" : "#e8eaf0", transition: "all .15s" }}>
                              <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: c.modo === "pct" ? "#CC0000" : T.t2(dark) }}>%</span>
                              <span style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: c.modo === "mxn" ? "#CC0000" : T.t2(dark) }}>$</span>
                              <div style={{ position: "absolute", top: 3, left: c.modo === "pct" ? 3 : 23, width: 22, height: 22, borderRadius: 11, background: "#CC0000", boxShadow: "0 1px 4px rgba(0,0,0,.25)", transition: "left .15s" }} />
                            </button>
                            {c.valor !== "" && r && <span style={{ fontSize: 10, color: T.t1(dark), fontFamily: "'JetBrains Mono',monospace", minWidth: 72, textAlign: "right" }}>{c.modo === "pct" ? mxn(enMXN) : `${enPct.toFixed(2)}%`}</span>}
                            <button onClick={() => setComisiones(cs => cs.filter(x => x.id !== c.id))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border(dark)}`, background: "transparent", color: T.t2(dark), fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-col-desktop-row">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Módulo de Rentabilidad Detallado</p>
                      <div style={{ ...flex, ...col, gap: 0 }}>
                        {r && [
                          ["Precio Final c/IVA", mxn(r.pSIVA * 1.16)],
                          ["IVA (16%)", mxn(r.iva)],
                          ["Precio s/IVA", mxn(r.pSIVA)],
                          ["Utilidad Bruta", mxn(r.uB)],
                          ["ISAN", `(${mxn(r.isan)})`],
                          ["Evaluación Corporativa", r.ec === 0 ? "— (BC activo)" : `(${mxn(r.ec)})`],
                          ...(r.totalComisiones > 0 ? [["Comisiones", `(${mxn(r.totalComisiones)})`]] : []),
                          ...(r.totalGastosOpExt > 0 ? [["Gastos Operativos Ext.", `(${mxn(r.totalGastosOpExt)})`]] : []),
                        ].map(([label, val]) => (
                          <div key={label} style={{ ...flex, justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border(dark)}` }}>
                            <span style={{ fontSize: 13, color: T.t1(dark) }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.t0(dark), fontFamily: "'JetBrains Mono',monospace" }}>{val}</span>
                          </div>
                        ))}

                        {r && (() => {
                          const intDiario = r.basePP * r.tasa / 360;
                          return (
                            <div style={{ borderBottom: `1px solid ${T.border(dark)}` }}>
                              <div style={{ ...flex, justifyContent: "space-between", padding: "9px 0" }}>
                                <span style={{ fontSize: 13, color: T.t1(dark) }}>Plan Piso</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: T.t0(dark), fontFamily: "'JetBrains Mono',monospace" }}>{r.diasF > 0 ? `(${mxn(r.pp)})` : "— (0 días)"}</span>
                              </div>
                              <div style={{ paddingLeft: 12, paddingBottom: 10, ...flex, ...col, gap: 6 }}>
                                <div style={{ ...flex, gap: 8, marginBottom: 2 }}>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>TIIE {fechaTiieAplicada ? `(${fechaTiieAplicada})` : ''}</label>
                                    <div style={{ position: "relative" }}>
                                      <input type="text" readOnly value={tiieInput || (TIIE_DEFAULT * 100).toFixed(2)} style={{ width: "100%", padding: "5px 22px 5px 8px", borderRadius: 6, background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, color: T.t1(dark), fontSize: 11, fontFamily: "'JetBrains Mono',monospace", cursor: "not-allowed" }} />
                                      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                                    </div>
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Adicional NRFM</label>
                                    <div style={{ position: "relative" }}>
                                      <input type="number" min={0} step={0.01} placeholder={(ADIC_DEFAULT * 100).toFixed(2)} value={adicInput} onChange={e => setAdicInput(e.target.value)} style={{ width: "100%", padding: "5px 22px 5px 8px", borderRadius: 6, background: T.cardBg(dark), border: `1px solid ${adicInput !== "" ? T.amber(dark) : T.border(dark)}`, color: T.t0(dark), fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} />
                                      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                                    </div>
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Tasa Total</label>
                                    <div style={{ padding: "5px 8px", borderRadius: 6, background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.t0(dark), fontWeight: 700 }}>{pct(r.tasa)}</div>
                                  </div>
                                </div>
                                {[
                                  ["Base (dist + cargos + cuotas + IVA)", mxn(r.basePP)],
                                  ["Interés diario", mxn(intDiario)],
                                  ["Días piso modelo", `${m.diasPP}d`],
                                  ["Días financiados (plazo − piso)", `${r.diasF}d`],
                                ].map(([lbl, val]) => (
                                  <div key={lbl} style={{ ...flex, justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 11, color: T.t2(dark) }}>{lbl}</span>
                                    <span style={{ fontSize: 11, color: T.t1(dark), fontFamily: "'JetBrains Mono',monospace" }}>{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                        {r && (
                          <div style={{ ...flex, justifyContent: "space-between", alignItems: "center", marginTop: 10, padding: "10px 12px", background: T.inputBg(dark), borderRadius: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: T.t0(dark) }}>Utilidad Operativa</span>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: ac, letterSpacing: ".03em" }}>{mxn(r.uopU)}</span>
                          </div>
                        )}
                        {!r && <p style={{ fontSize: 13, color: T.t2(dark), padding: "12px 0" }}>Configura precio y modelo para ver cálculos.</p>}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: "0 0 160px", border: `1px solid ${T.border(dark)}`, borderRadius: 12, background: T.inputBg(dark), padding: "20px 16px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Margen</p>
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 1, letterSpacing: ".02em", color: r ? ac : T.t3(dark) }}>{r ? pct(r.mg) : "—"}</p>
                      {r && <MargenBadge dark={dark} margen={r.mg} />}
                    </div>
                  </div>

                  {r && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border(dark)}` }}>
                      <div style={{ ...flex, alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em" }}>ISAN — Cálculo dinámico sobre Precio Final ({mxn(precioNegociado)})</p>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: r.isanInfo.factorExencion === 0 ? `${T.green(dark)}20` : r.isanInfo.factorExencion === 0.5 ? `${T.amber(dark)}20` : `${T.danger(dark)}12`, color: r.isanInfo.factorExencion === 0 ? T.green(dark) : r.isanInfo.factorExencion === 0.5 ? T.amber(dark) : T.danger(dark) }}>{r.isanInfo.motivoExencion}</span>
                      </div>
                      <div className="grid-resp-4" style={{ marginBottom: 10 }}>
                        {[
                          ["Precio Base (s/IVA s/ISAN)", mxn(r.isanInfo.precioBase)],
                          ["ISAN Bruto (100%)", mxn(r.isanInfo.isanFull)],
                          ["Factor Exención", r.isanInfo.factorExencion === 0 ? "Exento" : r.isanInfo.factorExencion === 0.5 ? "50%" : "Tasa Normal"],
                          ["ISAN a Pagar", mxn(r.isanInfo.isanPagable)],
                        ].map(([lbl, val]) => (
                          <div key={lbl} style={{ background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>{lbl}</p>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: T.t0(dark) }}>{val}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: `${T.green(dark)}0e`, border: `1px solid ${T.green(dark)}25`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: T.green(dark) }}>✓ Cálculo matemático legal basado en lista · Tasa efectiva ISAN: {r.isanInfo.tasaEfectiva.toFixed(2)}% sobre base</div>
                    </div>
                  )}
                </SectionCard>
              )}
            </div>

            <div style={{ ...flex, ...col, gap: 16, position: "sticky", top: 76 }}>
              <div style={{ background: noData ? T.cardBg(dark) : "linear-gradient(135deg, #CC0000 0%, #991111 100%)", borderRadius: 16, padding: "26px 24px", boxShadow: noData ? "none" : "0 8px 32px rgba(204,0,0,.35)", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "space-between", border: noData ? `1px solid ${T.border(dark)}` : "none" }}>
                {noData ? (
                  <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: T.t3(dark), letterSpacing: ".1em" }}>UTILIDAD TOTAL</p>
                    <p style={{ fontSize: 12, color: T.t2(dark), marginTop: 6 }}>Selecciona un modelo para comenzar</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: ".14em" }}>Utilidad Total de Flota</p>
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: "#fff", lineHeight: 1.05, marginTop: 6, letterSpacing: ".02em" }}>{mxn(r.uopT)}</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 6 }}>Basado en {safeNum} unidades · {mxn(r.uopU)} / ud.</p>
                    </div>
                    <div style={{ ...flex, alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", borderRadius: 10, padding: "10px 14px", marginTop: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>{pct(r.mg)}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.75)" }}>margen operativo</span>
                    </div>
                  </>
                )}
              </div>

              {r && (
                <div className="grid-resp-2">
                  <MetricCard dark={dark} label="Costo Financiero (Total)" value={mxn(r.pp * safeNum)} sub={`${r.diasF}d financiados`} />
                  <MetricCard dark={dark} label="Aportación NMEX" value={mxn(r.bonif.total * safeNum)} sub={`Cat. ${r.categoria}`} />
                </div>
              )}

              <div style={{ background: T.cardBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 14, overflow: "hidden", boxShadow: dark ? "0 2px 16px rgba(0,0,0,.3)" : "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ padding: "12px 16px", background: T.inputBg(dark), borderBottom: `1px solid ${T.border(dark)}` }}>
                  <p style={{ fontWeight: 700, fontSize: 12, color: T.t0(dark) }}>Resumen Comparativo</p>
                </div>
                <div className="table-container">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: T.inputBg(dark) }}>
                        {["Concepto", "Unitario", "Total"].map((h, i) => (
                          <th key={h} style={{ padding: "8px 14px", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: T.t2(dark), textAlign: i === 0 ? "left" : "right", borderBottom: `1px solid ${T.border(dark)}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {noData ? (
                        <tr><td colSpan={3} style={{ padding: "20px 14px", textAlign: "center", color: T.t2(dark), fontSize: 12 }}>— sin datos —</td></tr>
                      ) : webTableRows.map(([c, pu, tot, hl, isExpandable, isExpanded, toggleFn, isSub], i) => (
                        <tr key={i} onClick={isExpandable ? toggleFn : undefined} className={isExpandable ? "expandable-row" : ""} style={{ background: hl ? (dark ? "rgba(204,0,0,.08)" : "rgba(204,0,0,.04)") : (isSub ? (dark ? "#16181f" : "#f1f2f5") : (i % 2 === 0 ? "transparent" : T.rowAlt(dark))), borderBottom: `1px solid ${T.border(dark)}`, cursor: isExpandable ? "pointer" : "default", transition: "background .2s" }}>
                          <td style={{ padding: isSub ? "6px 14px 6px 30px" : "8px 14px", color: hl ? T.t0(dark) : (isSub ? T.t2(dark) : T.t1(dark)), fontWeight: hl ? 700 : 400, whiteSpace: "nowrap", fontSize: isSub ? 10 : 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            {c} {isExpandable && <span style={{ fontSize: 8, color: T.t2(dark) }}>{isExpanded ? "▲" : "▼"}</span>}
                          </td>
                          <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: isSub ? 10 : 11, color: hl ? ac : (isSub ? T.t2(dark) : T.t0(dark)), fontWeight: hl ? 700 : 400 }}>{pu}</td>
                          <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: isSub ? 10 : 11, color: hl ? ac : (isSub ? T.t2(dark) : T.t0(dark)), fontWeight: hl ? 700 : 400 }}>{tot}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border(dark)}` }}>
                  <p style={{ fontSize: 10, color: T.t2(dark), fontStyle: "italic", marginBottom: 10 }}>* Todos los valores en MXN sin IVA.</p>
                  {r && <p style={{ fontSize: 10, color: T.t1(dark), marginBottom: 10, fontFamily: "'JetBrains Mono',monospace" }}>Categoría: <strong style={{ color: T.t0(dark) }}>{catV}</strong> · TIIE: {pct(r.tasa)} · PP: {m.diasPP}d</p>}
                  <button onClick={handlePrint} disabled={noData} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: noData ? T.t3(dark) : (dark ? "#f0f1f5" : "#0f1117"), color: noData ? T.t2(dark) : (dark ? "#0f1117" : "#f0f1f5"), fontWeight: 700, fontSize: 12, cursor: noData ? "not-allowed" : "pointer", letterSpacing: ".04em" }}>Enviar a Dirección Comercial (PDF)</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer dark={dark} />
      </div>

      <PrintView
        r={r}
        m={m}
        safeNum={safeNum}
        cliente={cliente}
        modeloSeleccionado={modeloSeleccionado}
        safePlazo={safePlazo}
        catV={catV}
        comisiones={comisiones}
        gastosOpExt={gastosOpExt}
        costoClienteExtra={costoClienteExtra}
      />
    </>
  );
}
