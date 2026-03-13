import dbJson from "../data/Nissan_Lista_Precios_Calculadora_Distribuidor_Nissan_Marzo_2026.json";

export const TASA_IVA = 0.16;
export const TARIFA_ISAN = [
  { li: 0.01, ls: 383940.35, cf: 0.0, tasa: 0.020 },
  { li: 383940.36, ls: 460728.35, cf: 7678.67, tasa: 0.050 },
  { li: 460728.36, ls: 537516.64, cf: 11518.25, tasa: 0.100 },
  { li: 537516.65, ls: 691092.34, cf: 19197.04, tasa: 0.150 },
  { li: 691092.35, ls: Infinity, cf: 42233.35, tasa: 0.170 },
];
export const EXENTO_MAX = 356934.05;
export const EXENTO_50_MAX = 452116.48;
export const UMBRAL_LUJO = 1060189.93;
export const TASA_LUJO = 0.07;
export const TASA_CAMION = 0.05;

export const TIIE_DEFAULT = dbJson?.configuracion?.tiie || 0.1145;
export const ADIC_DEFAULT = dbJson?.configuracion?.nrfm || 0.0305;

export function calcularISAN(precioBase, tipo) {
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

export function precioBaseDesdeFinal(precioFinal, tipo) {
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

export function getBonificacion(m, categoria) {
  if (categoria === "MENUDEO") return { incentivo: 0, total: 0 };
  const incFijo = categoria === "A" ? m.incA : (categoria === "AA" || categoria === "AAA") ? m.incAA : 0;
  return { incentivo: incFijo, total: incFijo };
}

export function calcular({ m, num, plazo, bc, precio, categoriaSeleccionada, isanOvr, totalComisiones = 0, totalGastosOpExt = 0, tiie = TIIE_DEFAULT, adic = ADIC_DEFAULT }) {
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
  const uopU = uopU_bruta - totalComisiones - totalGastosOpExt;
  const iva = pSIVA * 0.16;

  return {
    pSIVA, bonif, uB, cargos, cuotas, pp, ec, isan: isanCalc, isanInfo,
    totalComisiones, totalGastosOpExt, uopU_bruta, iva,
    uopU, uopT: uopU * num,
    mg: pSIVA > 0 ? uopU / pSIVA : 0,
    desc, categoria, diasF, basePP,
    tiie, adic, tasa,
  };
}
