import { useState, useMemo, useEffect } from "react";

// ── IMPORTACIÓN DIRECTA DEL JSON ──
import dbJson from "./Nissan_Lista_Precios_Calculadora_Distribuidor_Nissan_Marzo_2026.json";
import tiieData from "./tiie.json";

/* ── Fonts, global styles & RESPONSIVE utilities ───────────────────────── */
const Styles = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
    input, select, button { font-family: 'Inter', sans-serif; }
    input:focus, select:focus { outline: none; }
    /* number input arrows */
    input[type=number]::-webkit-inner-spin-button { opacity: .4; }

    /* --- Clases Responsivas --- */
    .header-padding { padding: 0 16px; }
    @media (min-width: 768px) { .header-padding { padding: 0 32px; } }

    .main-padding { padding: 24px 16px; }
    @media (min-width: 768px) { .main-padding { padding: 32px 24px; } }

    .title-responsive { font-size: 28px !important; }
    @media (min-width: 768px) { .title-responsive { font-size: 38px !important; } }

    .layout-main { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
    @media (min-width: 1024px) { .layout-main { grid-template-columns: 1fr 460px; } }

    .grid-resp-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 768px) { .grid-resp-2 { grid-template-columns: 1fr 1fr; } }

    .grid-resp-3 { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 640px) { .grid-resp-3 { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .grid-resp-3 { grid-template-columns: 1fr 1fr 1fr; } }

    .grid-resp-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (min-width: 1024px) { .grid-resp-4 { grid-template-columns: 1fr 1fr 1fr 1fr; } }

    .flex-col-desktop-row { display: flex; flex-direction: column; gap: 16px; }
    @media (min-width: 1024px) { .flex-col-desktop-row { flex-direction: row; } }

    .commission-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    @media (min-width: 640px) { .commission-row { flex-wrap: nowrap; } }

    .hide-on-mobile { display: none !important; }
    @media (min-width: 768px) { .hide-on-mobile { display: flex !important; } }

    .table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .table-container table { min-width: 100%; }
    
    .expandable-row:hover { filter: brightness(0.96); }

    /* --- Theme Switcher --- */
    .theme-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      flex-shrink: 0;
    }
    .theme-switch input { opacity: 0; width: 0; height: 0; }
    .theme-slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #e2e8f0; transition: .4s; border-radius: 34px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }
    .theme-slider:before {
      position: absolute; content: "☀️"; display: flex; align-items: center;
      justify-content: center; font-size: 14px; height: 26px; width: 26px; left: 4px; bottom: 4px;
      background-color: white; transition: .4s cubic-bezier(0.4, 0.0, 0.2, 1);
      border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    input:checked + .theme-slider { background-color: #334155; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
    input:checked + .theme-slider:before { transform: translateX(26px); content: "🌙"; background-color: #1e293b; }

    /* ── REGLAS DE IMPRESIÓN (PDF) ── */
    .print-only { display: none; }
    @media print {
      body { background-color: #ffffff !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .print-only { 
        display: flex; 
        flex-direction: column;
        position: absolute; 
        top: 0; left: 0; 
        width: 100%; 
        height: 100%;
        background: white; 
        color: black;
        padding: 20px 30px;
        box-sizing: border-box;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { margin: 8mm; size: letter; } 
    }
  `}</style>
);

/* ── ISAN ENGINE ─────────────────────────────────────────────────────── */
const TASA_IVA = 0.16;
const TARIFA_ISAN = [
  { li: 0.01, ls: 383940.35, cf: 0.0, tasa: 0.020 },
  { li: 383940.36, ls: 460728.35, cf: 7678.67, tasa: 0.050 },
  { li: 460728.36, ls: 537516.64, cf: 11518.25, tasa: 0.100 },
  { li: 537516.65, ls: 691092.34, cf: 19197.04, tasa: 0.150 },
  { li: 691092.35, ls: Infinity, cf: 42233.35, tasa: 0.170 },
];
const EXENTO_MAX = 356934.05;
const EXENTO_50_MAX = 452116.48;
const UMBRAL_LUJO = 1060189.93;
const TASA_LUJO = 0.07;
const TASA_CAMION = 0.05;

function calcularISAN(precioBase, tipo) {
  let isanBruto = 0;
  const esCamion = tipo === "camion";
  const esElectrico = tipo === "electrico";

  if (esCamion) {
    isanBruto = precioBase * TASA_CAMION;
  } else {
    const tramo = TARIFA_ISAN.find(t => precioBase >= t.li && precioBase <= t.ls) ?? TARIFA_ISAN[TARIFA_ISAN.length - 1];
    isanBruto = tramo.cf + (precioBase - tramo.li) * tramo.tasa;
  }

  const reduccionLujo = (!esCamion && precioBase > UMBRAL_LUJO)
    ? (precioBase - UMBRAL_LUJO) * TASA_LUJO : 0;
  const isanFull = Math.max(isanBruto - reduccionLujo, 0);

  let factorExencion = 1.0;
  let motivoExencion = "Tarifa Normal";
  if (esElectrico) {
    factorExencion = 0.0;
    motivoExencion = "Eléctrico/Híbrido — Exento 100%";
  } else if (!esCamion) {
    if (precioBase <= EXENTO_MAX) {
      factorExencion = 0.0;
      motivoExencion = "Precio base bajo — Exento 100%";
    } else if (precioBase <= EXENTO_50_MAX) {
      factorExencion = 0.5;
      motivoExencion = "Rango medio — Exento 50%";
    }
  } else {
    motivoExencion = "Camión/Panel — Tasa fija 5%";
  }

  const isanPagable = isanFull * factorExencion;
  const montoDescuento = isanFull - isanPagable;
  const subtotal = precioBase + isanFull;
  const iva = subtotal * TASA_IVA;
  const total = subtotal + iva;
  const tasaEfectiva = precioBase > 0 ? (isanFull / precioBase) * 100 : 0;
  return {
    precioBase, isanBruto, reduccionLujo, isanFull, factorExencion, motivoExencion,
    isanPagable, montoDescuento, subtotal, iva, total, tasaEfectiva
  };
}

function precioBaseDesdeFinal(precioFinal, tipo) {
  if (!precioFinal || precioFinal <= 0) return 0;
  const subtotal = precioFinal / (1 + TASA_IVA);
  if (tipo === "camion") return subtotal / (1 + TASA_CAMION);
  const tramoAlto = TARIFA_ISAN[TARIFA_ISAN.length - 1];
  const isanEnUmbral = tramoAlto.cf + (UMBRAL_LUJO - tramoAlto.li) * tramoAlto.tasa;
  const subtotalEnUmbral = UMBRAL_LUJO + isanEnUmbral;
  if (subtotal > subtotalEnUmbral) {
    const num = subtotal - tramoAlto.cf + tramoAlto.li * tramoAlto.tasa - UMBRAL_LUJO * TASA_LUJO;
    return num / (1 + tramoAlto.tasa - TASA_LUJO);
  }
  for (const t of TARIFA_ISAN) {
    const base = (subtotal - t.cf + t.li * t.tasa) / (1 + t.tasa);
    if (base >= t.li - 0.1 && base <= t.ls + 0.1) return base;
  }
  return subtotal;
}

/* ── HELPER MATHEMATICS ──────────────────────────────────────────────── */
const TIIE_DEFAULT = dbJson?.configuracion?.tiie || 0.1145;
const ADIC_DEFAULT = dbJson?.configuracion?.nrfm || 0.0305;

const mxn = (n, compact = false) => {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1000)}k`;
  }
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};
const pct = n => `${(n * 100).toFixed(2)}%`;

function getBonificacion(m, categoria) {
  if (categoria === "MENUDEO") return { incentivo: 0, total: 0 };
  const incFijo = categoria === "A" ? m.incA : (categoria === "AA" || categoria === "AAA") ? m.incAA : 0;
  return { incentivo: incFijo, total: incFijo };
}

/* ── BUSCADOR DE TIIE HISTÓRICA ──────────────────────────────────────── */
function obtenerTiieHaceUnMes(historicoTiie) {
  if (!historicoTiie || historicoTiie.length === 0) return null;
  let fechaObjetivo = new Date();
  fechaObjetivo.setMonth(fechaObjetivo.getMonth() - 1);

  for (let i = 0; i < 15; i++) {
    let yyyy = fechaObjetivo.getFullYear();
    let mm = String(fechaObjetivo.getMonth() + 1).padStart(2, '0');
    let dd = String(fechaObjetivo.getDate()).padStart(2, '0');
    let fechaStr = `${yyyy}-${mm}-${dd}`;

    let registro = historicoTiie.find(item => item.fecha === fechaStr);
    if (registro && registro.tiie28 !== -922337000000.0 && registro.tiie28 > 0) {
      return { tasa: registro.tiie28, fechaStr: fechaStr };
    }
    fechaObjetivo.setDate(fechaObjetivo.getDate() - 1);
  }
  return null;
}

/* ── ADAPTADOR DE BASE DE DATOS (JSON) ───────────────────────────────── */
function mapJSONToModel(row, index) {
  const lista = parseFloat(row.total_lista) || 0;
  const bonoMes = parseFloat(row.bono_mes) || 0;
  const especial = bonoMes > 0 ? lista - bonoMes : 0;

  let tipoISAN = "auto";
  const strTipo = (row.tipo || "").toLowerCase();
  const strModelo = (row.modelo || "").toLowerCase();
  if (strTipo.includes("eléctrico") || strTipo.includes("electrico") || strModelo.includes("e-power")) {
    tipoISAN = "electrico";
  } else if (strTipo.includes("camión") || strTipo.includes("camion") || strModelo.includes("frontier") || strModelo.includes("np300")) {
    tipoISAN = "camion";
  }

  return {
    id: index,
    modelo: row.modelo,
    lista: lista,
    especial: especial,
    bonoMes: bonoMes,
    flotA: parseFloat(row.precio_a) || 0,
    flotAA: parseFloat(row.precio_aa) || 0,
    flotAAA: parseFloat(row.precio_aaa) || 0,
    dist: parseFloat(row.precio_base_dist) || 0,
    incA: parseFloat(row.incentivo_a) || 0,
    incAA: parseFloat(row.incentivo_aa) || 0,
    cargosTotales: parseFloat(row.cargos?.total) || 0,
    cuotasTotales: parseFloat(row.cuotas?.total) || 0,
    cargosObj: row.cargos || {},
    cuotasObj: row.cuotas || {},
    diasPP: Number.isNaN(parseInt(row.plan_piso_dias, 10)) ? 0 : parseInt(row.plan_piso_dias, 10),
    tipoISAN: tipoISAN,
    precioBasePub: parseFloat(row.precio_base_pub) || 0,
    isanLegal: parseFloat(row.isan) || 0,
  };
}

/* ── MOTOR FINANCIERO ────────────────────────────────────────────────── */
function calcular({ m, num, plazo, bc, precio, categoriaSeleccionada, isanOvr, totalComisiones = 0, tiie = TIIE_DEFAULT, adic = ADIC_DEFAULT }) {
  const tasa = tiie + adic;
  const baseParaDescuento = m.especial > 0 ? m.especial : m.lista;
  const desc = baseParaDescuento > 0 ? (baseParaDescuento - precio) / baseParaDescuento : 0;
  const categoria = categoriaSeleccionada;
  const bonif = getBonificacion(m, categoria);
  const cargos = m.cargosTotales;
  const cuotas = m.cuotasTotales;
  const pSIVA = precio / 1.16;

  const precioBaseCalculado = precioBaseDesdeFinal(precio, m.tipoISAN);
  const isanInfoCompleto = calcularISAN(precioBaseCalculado, m.tipoISAN);

  const isanCalc = isanOvr !== undefined ? isanOvr : isanInfoCompleto.isanPagable;
  const isanInfo = isanInfoCompleto;

  const uB = pSIVA + bonif.total - m.dist - cargos - cuotas;
  const diasF = Math.max(0, plazo - m.diasPP);
  const basePP = m.dist + cargos + cuotas + (m.dist + cargos) * 0.16;
  const pp = (basePP * tasa / 360) * diasF;
  const ec = bc ? 0 : m.dist * 0.025;

  const uopU_bruta = uB - isanCalc - pp - ec;
  const uopU = uopU_bruta - totalComisiones;
  const iva = pSIVA * 0.16;

  return {
    pSIVA, bonif, uB, cargos, cuotas, pp, ec, isan: isanCalc, isanInfo,
    totalComisiones, uopU_bruta, iva,
    uopU, uopT: uopU * num,
    mg: pSIVA > 0 ? uopU / pSIVA : 0,
    desc, categoria, diasF, basePP,
    tiie, adic, tasa,
  };
}

/* ── Helpers UI ──────────────────────────────────────────────────────── */
const T = {
  pageBg: d => d ? "#0f1117" : "#f1f2f5",
  headerBg: d => d ? "#16181f" : "#ffffff",
  cardBg: d => d ? "#1c1f28" : "#ffffff",
  inputBg: d => d ? "#23262f" : "#f8f9fb",
  rowAlt: d => d ? "#1f2230" : "#f8f9fb",
  border: d => d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
  border2: d => d ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)",
  t0: d => d ? "#f0f1f5" : "#0f1117",
  t1: d => d ? "#8b8fa8" : "#555872",
  t2: d => d ? "#555872" : "#8b8fa8",
  t3: d => d ? "#2e3044" : "#d0d2dc",
  green: d => d ? "#1fd8a4" : "#0a8f6e",
  amber: d => d ? "#f59e0b" : "#c47800",
  danger: d => d ? "#ef4444" : "#cc1c1c",
};

function Input({ dark, label, ...props }) {
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

function SectionCard({ dark, icon, title, children, style = {} }) {
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

function MargenBadge({ dark, margen }) {
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

function MetricCard({ dark, label, value, sub }) {
  return (
    <div style={{ background: T.cardBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 14, padding: "20px 22px", boxShadow: dark ? "0 2px 16px rgba(0,0,0,.3)" : "0 2px 12px rgba(0,0,0,.06)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: T.t0(dark), letterSpacing: ".02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: T.t1(dark), marginTop: 5 }}>{sub}</p>}
    </div>
  );
}

/* ── MAIN APP ───────────────────────────────────────────────────────── */
export default function App() {
  const [dark, setDark] = useState(false);
  const [loadingDb, setLoadingDb] = useState(true);

  const [modelosData, setModelosData] = useState([]);
  const [vigenciaDB, setVigenciaDB] = useState("Cargando vigencia...");

  const [cliente, setCliente] = useState("");
  const [num, setNum] = useState(5);
  const [plazo, setPlazo] = useState(30);
  const [bc, setBC] = useState(false);

  const [tiieInput, setTiieInput] = useState("");
  const [fechaTiieAplicada, setFechaTiieAplicada] = useState("");
  const [adicInput, setAdicInput] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("MENUDEO");
  const [precioNegociadoInput, setPrecioNegociadoInput] = useState(""); // <-- NUEVO ESTADO
  const [isanOvr, setIsanOvr] = useState("");

  const [expandCargos, setExpandCargos] = useState(false);
  const [expandCuotas, setExpandCuotas] = useState(false);

  const [comisiones, setComisiones] = useState([
    { id: 1, nombre: "Vendedor", valor: "", modo: "pct" },
  ]);
  const nextId = () => Date.now();

  useEffect(() => {
    if (dbJson && dbJson.versiones) {
      const modelosParseados = dbJson.versiones.map((row, i) => mapJSONToModel(row, i));
      setModelosData(modelosParseados);
      setVigenciaDB(dbJson.meta?.vigencia || "Vigencia no especificada");
      setLoadingDb(false);
    } else {
      console.error("No se pudo cargar el JSON.");
      setVigenciaDB("Error leyendo base de datos");
      setLoadingDb(false);
    }

    const tiieEncontrada = obtenerTiieHaceUnMes(tiieData);
    if (tiieEncontrada) {
      setTiieInput(tiieEncontrada.tasa.toString());
      setFechaTiieAplicada(tiieEncontrada.fechaStr);
    }
  }, []);

  const m = modelosData.find(x => x.modelo === modeloSeleccionado);
  const baseParaDescuento = m ? (m.especial > 0 ? m.especial : m.lista) : 0;

  // Lógica de Precio y Descuentos
  let descFijo = 0;
  if (categoriaSeleccionada === "A") descFijo = 0.03;
  else if (categoriaSeleccionada === "AA") descFijo = 0.05;
  else if (categoriaSeleccionada === "AAA") descFijo = 0.07;

  const pF = m ? baseParaDescuento * (1 - descFijo) : 0; // Precio Final de la categoría
  const esAAA = categoriaSeleccionada === "AAA";

  // Si es AAA y escribieron algo, usamos ese monto. Si no, usamos el pF normal.
  const precioNegociado = (esAAA && precioNegociadoInput !== "") ? parseFloat(precioNegociadoInput) : pF;
  const descuentoAdicional = pF > 0 ? ((pF - precioNegociado) / pF) : 0;

  const iOvr = isanOvr !== "" ? parseFloat(isanOvr) : undefined;
  const tiie = tiieInput !== "" ? parseFloat(tiieInput) / 100 : TIIE_DEFAULT;
  const adic = adicInput !== "" ? parseFloat(adicInput) / 100 : ADIC_DEFAULT;
  const safeNum = num === "" ? 0 : parseInt(num, 10) || 0;
  const safePlazo = plazo === "" ? 0 : parseInt(plazo, 10) || 0;

  // Los cálculos se ejecutan usando "precioNegociado"
  const rBase = useMemo(() => {
    if (!m || !pF) return null;
    return calcular({ m, num: safeNum, plazo: safePlazo, bc, precio: precioNegociado, categoriaSeleccionada, isanOvr: iOvr, totalComisiones: 0, tiie, adic });
  }, [m, safeNum, safePlazo, bc, pF, precioNegociado, categoriaSeleccionada, iOvr, tiie, adic]);

  const totalComisiones = useMemo(() => {
    if (!rBase) return 0;
    return comisiones.reduce((acc, c) => {
      const v = parseFloat(c.valor) || 0;
      if (!v) return acc;
      if (c.modo === "pct") return acc + rBase.uopU_bruta * (v / 100);
      return acc + v;
    }, 0);
  }, [rBase, comisiones]);

  const r = useMemo(() => {
    if (!m || !pF) return null;
    return calcular({ m, num: safeNum, plazo: safePlazo, bc, precio: precioNegociado, categoriaSeleccionada, isanOvr: iOvr, totalComisiones, tiie, adic });
  }, [m, safeNum, safePlazo, bc, pF, precioNegociado, categoriaSeleccionada, iOvr, totalComisiones, tiie, adic]);

  const catV = r ? r.categoria : "—";
  const ac = r ? (r.mg < 0 ? T.danger(dark) : r.mg <= 0.015 ? T.amber(dark) : T.t0(dark)) : T.t0(dark);
  const noData = !r;

  // ── RECONSTRUCCIÓN DINÁMICA: TABLA WEB (Colapsable) ──
  let webTableRows = [];
  if (r) {
    webTableRows.push(["Precio Final c/IVA", mxn(r.pSIVA * 1.16), mxn(r.pSIVA * 1.16 * safeNum)]);
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

  // ── RECONSTRUCCIÓN DINÁMICA: TABLA PDF (Siempre expandida) ──
  let printTableRows = [];
  if (r) {
    printTableRows.push(["Precio Final c/IVA", mxn(r.pSIVA * 1.16), mxn(r.pSIVA * 1.16 * safeNum), false, false]);
    printTableRows.push(["IVA (16%)", mxn(r.iva), mxn(r.iva * safeNum), false, false]);
    printTableRows.push(["Precio s/IVA", mxn(r.pSIVA), mxn(r.pSIVA * safeNum), false, false]);
    printTableRows.push(["Costo Distribuidor", `(${mxn(m.dist)})`, `(${mxn(m.dist * safeNum)})`, false, false]);

    printTableRows.push(["Cargos Extras", `(${mxn(r.cargos)})`, `(${mxn(r.cargos * safeNum)})`, false, false]);
    if (m.cargosObj) {
      if (m.cargosObj.promo_pub) printTableRows.push(["↳ Promoción y Pub.", `(${mxn(m.cargosObj.promo_pub)})`, `(${mxn(m.cargosObj.promo_pub * safeNum)})`, false, true]);
      if (m.cargosObj.prima_asist) printTableRows.push(["↳ Prima Asistencia", `(${mxn(m.cargosObj.prima_asist)})`, `(${mxn(m.cargosObj.prima_asist * safeNum)})`, false, true]);
      if (m.cargosObj.cuota_tras) printTableRows.push(["↳ Cuota Traslado", `(${mxn(m.cargosObj.cuota_tras)})`, `(${mxn(m.cargosObj.cuota_tras * safeNum)})`, false, true]);
      if (m.cargosObj.seg_tras) printTableRows.push(["↳ Seguro Traslado", `(${mxn(m.cargosObj.seg_tras)})`, `(${mxn(m.cargosObj.seg_tras * safeNum)})`, false, true]);
    }

    printTableRows.push(["Cuotas", `(${mxn(r.cuotas)})`, `(${mxn(r.cuotas * safeNum)})`, false, false]);
    if (m.cuotasObj) {
      if (m.cuotasObj.amda) printTableRows.push(["↳ Cuota AMDA", `(${mxn(m.cuotasObj.amda)})`, `(${mxn(m.cuotasObj.amda * safeNum)})`, false, true]);
      if (m.cuotasObj.andanac) printTableRows.push(["↳ Cuota ANDANAC", `(${mxn(m.cuotasObj.andanac)})`, `(${mxn(m.cuotasObj.andanac * safeNum)})`, false, true]);
      if (m.cuotasObj.promei) printTableRows.push(["↳ Cuota PROMEI", `(${mxn(m.cuotasObj.promei)})`, `(${mxn(m.cuotasObj.promei * safeNum)})`, false, true]);
      if (m.cuotasObj.seguro_pp) printTableRows.push(["↳ Seguro Plan Piso", `(${mxn(m.cuotasObj.seguro_pp)})`, `(${mxn(m.cuotasObj.seguro_pp * safeNum)})`, false, true]);
      if (m.cuotasObj.ayuda_social) printTableRows.push(["↳ Ayuda Social", `(${mxn(m.cuotasObj.ayuda_social)})`, `(${mxn(m.cuotasObj.ayuda_social * safeNum)})`, false, true]);
    }

    printTableRows.push(["Incentivo NMEX", mxn(r.bonif.total), mxn(r.bonif.total * safeNum), false, false]);
    printTableRows.push(["Utilidad Bruta", mxn(r.uB), mxn(r.uB * safeNum), false, false]);
    printTableRows.push(["ISAN", `(${mxn(r.isan)})`, `(${mxn(r.isan * safeNum)})`, false, false]);
    printTableRows.push(["Plan Piso", `(${mxn(r.pp)})`, `(${mxn(r.pp * safeNum)})`, false, false]);
    printTableRows.push(["Eval. Corporativa", r.ec === 0 ? "—" : `(${mxn(r.ec)})`, r.ec === 0 ? "—" : `(${mxn(r.ec * safeNum)})`, false, false]);

    if (r.totalComisiones > 0) {
      printTableRows.push(["Comisiones", `(${mxn(r.totalComisiones)})`, `(${mxn(r.totalComisiones * safeNum)})`, false, false]);
    }

    printTableRows.push(["U. Operativa", mxn(r.uopU), mxn(r.uopT), true, false]);
    printTableRows.push(["Margen", pct(r.mg), pct(r.mg), true, false]);
  }

  const flex = { display: "flex" };
  const col = { flexDirection: "column" };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Styles dark={dark} />

      {/* ── INTERFAZ DE LA APLICACIÓN (Se oculta al imprimir) ── */}
      <div className="no-print" style={{ minHeight: "100vh", background: T.pageBg(dark), transition: "background .25s" }}>

        {/* Header App */}
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

        {/* Main App */}
        <main className="main-padding" style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 className="title-responsive" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: ".04em", color: T.t0(dark), lineHeight: 1 }}>Calculadora de Rentabilidad</h1>
            <p style={{ fontSize: 13, color: T.t1(dark), marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: loadingDb ? T.amber(dark) : T.green(dark) }}></span>
              {vigenciaDB}
            </p>
          </div>

          <div className="layout-main">

            {/* Left column */}
            <div style={{ ...flex, ...col, gap: 20 }}>
              <SectionCard dark={dark} icon="👤" title="Información del Cliente">
                <div className="grid-resp-2">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Input dark={dark} label="Nombre de la Empresa" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej. Logística Global S.A." type="text" />
                  </div>
                  <Input dark={dark} label="Número de Unidades" value={num} onChange={e => setNum(e.target.value)} type="number" min={1} max={500} />
                  <Input dark={dark} label="Plazo de Pago (Días)" value={plazo} onChange={e => setPlazo(e.target.value)} type="number" min={0} max={180} />
                </div>
                <div style={{
                  ...flex, justifyContent: "space-between", alignItems: "center",
                  marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border(dark)}`,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.t0(dark) }}>Business Case (BC)</div>
                    <div style={{ fontSize: 12, color: T.t1(dark), marginTop: 2 }}>
                      {bc ? "Activo — Evaluación corporativa exenta" : "Sin BC — aplica cargo de evaluación"}
                    </div>
                  </div>
                  <button onClick={() => setBC(n => !n)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: bc ? "#CC0000" : T.t3(dark), position: "relative", transition: "background .2s", flexShrink: 0,
                      boxShadow: bc ? "0 0 12px rgba(204,0,0,.4)" : "none",
                    }}>
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
                      <input type="text" value={m ? mxn(pF) : ""} readOnly
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`,
                          color: T.t1(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                          cursor: "not-allowed", opacity: 0.8
                        }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Descuento Base (%)</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" readOnly
                          value={m ? (descFijo * 100).toFixed(2) : ""}
                          style={{
                            width: "100%", padding: "9px 12px", paddingRight: 28, borderRadius: 8,
                            background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`,
                            color: T.t1(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                            cursor: "not-allowed", opacity: 0.8
                          }} />
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Cat. de Venta</label>
                      <select value={categoriaSeleccionada} onChange={e => {
                        setCategoriaSeleccionada(e.target.value);
                        setPrecioNegociadoInput("");
                      }}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textAlign: "center",
                          background: categoriaSeleccionada === "AAA" ? "rgba(204,0,0,.12)" : categoriaSeleccionada === "AA" ? "rgba(168,85,247,.12)" : categoriaSeleccionada === "A" ? "rgba(59,130,246,.12)" : T.inputBg(dark),
                          border: `1.5px solid ${categoriaSeleccionada === "AAA" ? "#CC000044" : categoriaSeleccionada === "AA" ? "#a855f744" : categoriaSeleccionada === "A" ? "#3b82f644" : T.border(dark)}`,
                          color: categoriaSeleccionada === "AAA" ? "#CC0000" : categoriaSeleccionada === "AA" ? (dark ? "#c084fc" : "#7c3aed") : categoriaSeleccionada === "A" ? (dark ? "#60a5fa" : "#1d4ed8") : T.t1(dark),
                          cursor: "pointer", appearance: "none"
                        }}>
                        <option value="MENUDEO">MENUDEO (0%)</option>
                        <option value="A">A (3%)</option>
                        <option value="AA">AA (5%)</option>
                        <option value="AAA">AAA (7%)</option>
                      </select>
                    </div>
                  </div>

                  {/* NUEVA FILA: Precio Negociado y Descuento Adicional */}
                  <div className="grid-resp-2" style={{ marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>
                        Precio Negociado c/IVA {categoriaSeleccionada !== "AAA" && <span style={{ fontSize: 10, fontWeight: 400 }}>(Requiere Cat. AAA)</span>}
                      </label>
                      <input type="number"
                        value={esAAA ? precioNegociadoInput : ""}
                        onChange={e => setPrecioNegociadoInput(e.target.value)}
                        disabled={!esAAA}
                        placeholder={esAAA ? pF.toFixed(0) : "Bloqueado"}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          background: esAAA ? T.inputBg(dark) : (dark ? "#16181f" : "#e2e8f0"),
                          border: `2px solid ${esAAA ? "#CC0000" : T.border(dark)}`,
                          color: T.t0(dark), fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                          cursor: esAAA ? "text" : "not-allowed", opacity: esAAA ? 1 : 0.6, transition: "all .2s"
                        }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.t1(dark), marginBottom: 6 }}>Descuento Adicional (%)</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" readOnly
                          value={esAAA && precioNegociadoInput !== "" ? (descuentoAdicional * 100).toFixed(2) : "0.00"}
                          style={{
                            width: "100%", padding: "9px 12px", paddingRight: 28, borderRadius: 8,
                            background: esAAA ? T.inputBg(dark) : (dark ? "#16181f" : "#e2e8f0"),
                            border: `2px solid ${esAAA && descuentoAdicional > 0 ? T.amber(dark) : (esAAA ? T.border2(dark) : T.border(dark))}`,
                            color: esAAA && descuentoAdicional > 0 ? T.amber(dark) : T.t0(dark),
                            fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                            cursor: "not-allowed", opacity: esAAA ? 1 : 0.6, transition: "all .2s"
                          }} />
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

                  <div style={{ marginBottom: 20, padding: "16px", background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, borderRadius: 12 }}>
                    <div style={{ ...flex, justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em" }}>Comisiones</p>
                      <div style={{ ...flex, alignItems: "center", gap: 8 }}>
                        {totalComisiones > 0 && r && (
                          <span className="hide-on-mobile" style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: T.danger(dark) }}>
                            Total: ({mxn(totalComisiones)})
                          </span>
                        )}
                        <button onClick={() => setComisiones(cs => [...cs, { id: nextId(), nombre: "", valor: "", modo: "pct" }])}
                          style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border2(dark)}`, background: "transparent", color: T.t1(dark), fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          + Agregar
                        </button>
                      </div>
                    </div>
                    {comisiones.length === 0 && (
                      <p style={{ fontSize: 12, color: T.t2(dark), textAlign: "center", padding: "8px 0" }}>Sin comisiones registradas</p>
                    )}
                    <div style={{ ...flex, ...col, gap: 12 }}>
                      {comisiones.map((c, i) => {
                        const valNum = parseFloat(c.valor) || 0;
                        const uBase = r ? r.uopU_bruta : 0;
                        const enMXN = c.modo === "pct" ? uBase * (valNum / 100) : valNum;
                        const enPct = c.modo === "mxn" ? (uBase > 0 ? (valNum / uBase) * 100 : 0) : valNum;
                        return (
                          <div key={c.id} className="commission-row">
                            <input placeholder="Concepto (ej. Vendedor)" value={c.nombre}
                              onChange={e => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, nombre: e.target.value } : x))}
                              style={{ flex: 2, minWidth: 120, padding: "7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12 }} />

                            <div style={{ flex: 1, minWidth: 90, position: "relative" }}>
                              <input type="number" min={0} placeholder="0" value={c.valor}
                                onChange={e => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, valor: e.target.value } : x))}
                                style={{ width: "100%", padding: "7px 28px 7px 10px", borderRadius: 7, background: T.cardBg(dark), border: `1px solid ${T.border2(dark)}`, color: T.t0(dark), fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }} />
                              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.t2(dark), pointerEvents: "none" }}>
                                {c.modo === "pct" ? "%" : "$"}
                              </span>
                            </div>

                            <button onClick={() => setComisiones(cs => cs.map(x => x.id === c.id ? { ...x, modo: x.modo === "pct" ? "mxn" : "pct", valor: "" } : x))}
                              style={{
                                width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative", flexShrink: 0,
                                background: dark ? "#2a2f3e" : "#e8eaf0", transition: "all .15s"
                              }}>
                              <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: c.modo === "pct" ? "#CC0000" : T.t2(dark) }}>%</span>
                              <span style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: c.modo === "mxn" ? "#CC0000" : T.t2(dark) }}>$</span>
                              <div style={{
                                position: "absolute", top: 3, left: c.modo === "pct" ? 3 : 23, width: 22, height: 22, borderRadius: 11,
                                background: "#CC0000", boxShadow: "0 1px 4px rgba(0,0,0,.25)", transition: "left .15s"
                              }} />
                            </button>

                            {c.valor !== "" && r && (
                              <span style={{ fontSize: 10, color: T.t1(dark), fontFamily: "'JetBrains Mono',monospace", minWidth: 72, textAlign: "right" }}>
                                {c.modo === "pct" ? mxn(enMXN) : `${enPct.toFixed(2)}%`}
                              </span>
                            )}
                            <button onClick={() => setComisiones(cs => cs.filter(x => x.id !== c.id))}
                              style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border(dark)}`, background: "transparent", color: T.t2(dark), fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>
                              ×
                            </button>
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
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>
                                      TIIE {fechaTiieAplicada ? `(${fechaTiieAplicada})` : ''}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <input type="text" readOnly
                                        value={tiieInput || (TIIE_DEFAULT * 100).toFixed(2)}
                                        style={{
                                          width: "100%", padding: "5px 22px 5px 8px", borderRadius: 6,
                                          background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`,
                                          color: T.t1(dark), fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                                          cursor: "not-allowed"
                                        }} />
                                      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                                    </div>
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>
                                      Adicional NRFM
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <input type="number" min={0} step={0.01} placeholder={(ADIC_DEFAULT * 100).toFixed(2)}
                                        value={adicInput} onChange={e => setAdicInput(e.target.value)}
                                        style={{
                                          width: "100%", padding: "5px 22px 5px 8px", borderRadius: 6,
                                          background: T.cardBg(dark), border: `1px solid ${adicInput !== "" ? T.amber(dark) : T.border(dark)}`,
                                          color: T.t0(dark), fontSize: 11, fontFamily: "'JetBrains Mono',monospace"
                                        }} />
                                      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: T.t2(dark), pointerEvents: "none" }}>%</span>
                                    </div>
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Tasa Total</label>
                                    <div style={{ padding: "5px 8px", borderRadius: 6, background: T.inputBg(dark), border: `1px solid ${T.border(dark)}`, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.t0(dark), fontWeight: 700 }}>
                                      {pct(r.tasa)}
                                    </div>
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

                    <div style={{
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: "0 0 160px",
                      border: `1px solid ${T.border(dark)}`, borderRadius: 12, background: T.inputBg(dark), padding: "20px 16px"
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: T.t2(dark), textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Margen</p>
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 1, letterSpacing: ".02em", color: r ? ac : T.t3(dark) }}>
                        {r ? pct(r.mg) : "—"}
                      </p>
                      {r && <MargenBadge dark={dark} margen={r.mg} />}
                    </div>
                  </div>

                  {r && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border(dark)}` }}>
                      <div style={{ ...flex, alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: T.t1(dark), textTransform: "uppercase", letterSpacing: ".08em" }}>
                          ISAN — Cálculo dinámico sobre Precio Final ({mxn(precioNegociado)})
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
                          background: r.isanInfo.factorExencion === 0 ? `${T.green(dark)}20` : r.isanInfo.factorExencion === 0.5 ? `${T.amber(dark)}20` : `${T.danger(dark)}12`,
                          color: r.isanInfo.factorExencion === 0 ? T.green(dark) : r.isanInfo.factorExencion === 0.5 ? T.amber(dark) : T.danger(dark),
                        }}>{r.isanInfo.motivoExencion}</span>
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
                      <div style={{ background: `${T.green(dark)}0e`, border: `1px solid ${T.green(dark)}25`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: T.green(dark) }}>
                        ✓ Cálculo matemático legal basado en lista · Tasa efectiva ISAN: {r.isanInfo.tasaEfectiva.toFixed(2)}% sobre base
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}
            </div>

            {/* Right column */}
            <div style={{ ...flex, ...col, gap: 16, position: "sticky", top: 76 }}>
              <div style={{
                background: noData ? T.cardBg(dark) : "linear-gradient(135deg, #CC0000 0%, #991111 100%)",
                borderRadius: 16, padding: "26px 24px",
                boxShadow: noData ? "none" : "0 8px 32px rgba(204,0,0,.35)",
                minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "space-between",
                border: noData ? `1px solid ${T.border(dark)}` : "none",
              }}>
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
                        <tr key={i}
                          onClick={isExpandable ? toggleFn : undefined}
                          className={isExpandable ? "expandable-row" : ""}
                          style={{
                            background: hl ? (dark ? "rgba(204,0,0,.08)" : "rgba(204,0,0,.04)") : (isSub ? (dark ? "#16181f" : "#f1f2f5") : (i % 2 === 0 ? "transparent" : T.rowAlt(dark))),
                            borderBottom: `1px solid ${T.border(dark)}`,
                            cursor: isExpandable ? "pointer" : "default",
                            transition: "background .2s"
                          }}>
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
                  {r && (
                    <p style={{ fontSize: 10, color: T.t1(dark), marginBottom: 10, fontFamily: "'JetBrains Mono',monospace" }}>
                      Categoría: <strong style={{ color: T.t0(dark) }}>{catV}</strong> · TIIE: {pct(r.tasa)} · PP: {m.diasPP}d
                    </p>
                  )}
                  {/* Botón que detona la impresión */}
                  <button
                    onClick={handlePrint}
                    disabled={noData}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 9, border: "none",
                      background: noData ? T.t3(dark) : (dark ? "#f0f1f5" : "#0f1117"),
                      color: noData ? T.t2(dark) : (dark ? "#0f1117" : "#f0f1f5"),
                      fontWeight: 700, fontSize: 12, cursor: noData ? "not-allowed" : "pointer", letterSpacing: ".04em"
                    }}>
                    Enviar a Dirección Comercial (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ borderTop: `1px solid ${T.border(dark)}`, padding: "16px 32px", textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 11, color: T.t2(dark) }}>© 2026 GRUPO TORRES CORZO S.A. de C.V. · Nissan Mexicana Fleet Management System · Confidencial</p>
        </footer>
      </div>


      {/* ── PLANTILLA EXCLUSIVA PARA PDF (Solo visible al imprimir) ── */}
      {r && (
        <div className="print-only">

          {/* Marca de agua Nissan */}
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: -1, opacity: 0.04, pointerEvents: "none" }}>
            <svg viewBox="0 0 504 421.7" width="500" height="500" fill="#000000" xmlns="http://www.w3.org/2000/svg">
              <path d="m293.7 227.7c-.4.1-2 .1-2.7.1h-51.6v12h52.5c.4 0 3.5 0 4.1-.1 10.7-1 15.6-9.9 15.6-17.7 0-8-5.1-16.6-14.8-17.5-1.9-.2-3.5-.2-4.2-.2h-34.3c-1.5 0-3.2-.1-3.8-.3-2.7-.7-3.7-3.1-3.7-5.1 0-1.8 1-4.2 3.8-5 .8-.2 1.7-.3 3.6-.3h49.5v-11.8h-50.3c-2.1 0-3.7.1-5 .3-8.6 1.2-14.6 8.1-14.6 16.9 0 7.2 4.5 15.6 14.4 17 1.8.2 4.3.2 5.4.2h33.4c.6 0 2.1 0 2.4.1 3.8.5 5.1 3.3 5.1 5.8 0 2.4-1.5 5-4.8 5.6zm-97.8 0c-.4.1-2 .1-2.6.1h-51.7v12h52.5c.4 0 3.5 0 4.1-.1 10.7-1 15.6-9.9 15.6-17.7 0-8-5.1-16.6-14.8-17.5-1.9-.2-3.5-.2-4.2-.2h-34.3c-1.5 0-3.2-.1-3.8-.3-2.7-.7-3.7-3.1-3.7-5.1 0-1.8 1-4.2 3.8-5 .8-.2 1.7-.3 3.6-.3h49.5v-11.8h-50.3c-2.1 0-3.7.1-5 .3-8.6 1.2-14.6 8.1-14.6 16.9 0 7.2 4.5 15.6 14.4 17 1.8.2 4.3.2 5.4.2h33.4c.6 0 2.1 0 2.4.1 3.8.5 5.1 3.3 5.1 5.8 0 2.4-1.4 5-4.8 5.6zm-94.2-46.3h13v58.7h-13zm-85 0h-16.7v58.7h13v-44l43.6 44h16.4v-58.7h-13v43.8zm414.4 58.7h13v-44l43.5 44h16.4v-58.7h-12.9v43.8l-43.3-43.8h-16.7zm-67.7-58.7-36.6 58.7h15.8l6.5-10.5h42.7l6.5 10.5h15.7l-36.6-58.7zm21.7 37.1h-29.3l14.7-23.6zm-312.8-70.4c26.2-76.5 98.4-127.9 179.8-127.9s153.7 51.4 179.8 127.9l.2.6h57.3v-6.9l-23.8-2.8c-14.7-1.7-17.8-8.2-21.8-16.4l-1-2c-34.4-73.2-109.3-120.6-190.7-120.6-81.5 0-156.3 47.4-190.7 120.8l-1 2c-4 8.2-7.1 14.7-21.8 16.4l-23.8 2.8v6.9h57.2zm359.8 124.8-.2.6c-26.2 76.5-98.4 127.8-179.8 127.8s-153.7-51.4-179.8-127.9l-.2-.6h-57.2v6.9l23.8 2.8c14.7 1.7 17.8 8.2 21.8 16.4l1 2c34.4 73.4 109.3 120.8 190.7 120.8s156.3-47.4 190.7-120.7l1-2c4-8.2 7.1-14.7 21.8-16.4l23.8-2.8v-6.9z" />
            </svg>
          </div>

          {/* Encabezado Corporativo */}
          <div style={{ borderBottom: "3px solid #CC0000", paddingBottom: 10, marginBottom: 16 }}>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "#CC0000", margin: 0, letterSpacing: ".02em" }}>GRUPO TORRES CORZO S.A. de C.V.</h1>
            <p style={{ fontSize: 14, color: "#333", margin: "2px 0 0 0", fontWeight: 600 }}>División de Flotas · Resumen de Rentabilidad</p>
          </div>

          {/* Datos del Cliente y Vehículo */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 11, color: "#000", lineHeight: 1.5 }}>
            <div>
              <p style={{ margin: "2px 0" }}><strong>Cliente:</strong> {cliente || "Sin especificar"}</p>
              <p style={{ margin: "2px 0" }}><strong>Modelo:</strong> {modeloSeleccionado}</p>
              <p style={{ margin: "2px 0" }}><strong>Número de Unidades:</strong> {safeNum}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "2px 0" }}><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-MX')}</p>
              <p style={{ margin: "2px 0" }}><strong>Plazo de Pago:</strong> {safePlazo} días</p>
              <p style={{ margin: "2px 0" }}><strong>Cat. de Venta / TIIE:</strong> {catV} / {pct(r.tasa)}</p>
            </div>
          </div>

          {/* Tabla de Rentabilidad (Compacta y SIEMPRE desglosada) */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 20, border: "1px solid #ddd" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Concepto</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Unitario</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {printTableRows.map(([c, pu, tot, hl, isSub], i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee", background: hl ? "#f8f8f8" : "transparent" }}>
                  <td style={{ padding: "4px 8px", paddingLeft: isSub ? "25px" : "8px", fontWeight: hl ? 700 : (isSub ? 400 : 600), color: isSub ? "#555" : "#000" }}>
                    {c}
                  </td>
                  <td style={{ padding: "4px 8px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: hl ? 700 : 400 }}>{pu}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: hl ? 700 : 400 }}>{tot}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bloque de Firmas */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 40, textAlign: "center", fontSize: 11 }}>
            <div style={{ width: "28%" }}>
              <div style={{ borderBottom: "1px solid #000", height: 40, marginBottom: 6 }}></div>
              <strong style={{ fontSize: 12 }}>{comisiones[0]?.nombre || 'Asesor Comercial'}</strong><br />
              <span style={{ color: "#555" }}>Ventas Flotillas</span>
            </div>
            <div style={{ width: "28%" }}>
              <div style={{ borderBottom: "1px solid #000", height: 40, marginBottom: 6 }}></div>
              <strong style={{ fontSize: 12 }}>Gerente Comercial</strong><br />
              <span style={{ color: "#555" }}>GRUPO TORRES CORZO</span>
            </div>
            <div style={{ width: "28%" }}>
              <div style={{ borderBottom: "1px solid #000", height: 40, marginBottom: 6 }}></div>
              <strong style={{ fontSize: 12 }}>Director Comercial</strong><br />
              <span style={{ color: "#555" }}>GRUPO TORRES CORZO</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}