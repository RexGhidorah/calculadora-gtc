export function obtenerTiieHaceUnMes(historicoTiie) {
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

export function mapJSONToModel(row, index) {
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
