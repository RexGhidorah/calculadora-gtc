import { useState, useEffect, useMemo } from "react";
import dbJson from "../data/Nissan_Lista_Precios_Calculadora_Distribuidor_Nissan_Marzo_2026.json";
import tiieData from "../data/tiie.json";
import { mapJSONToModel, obtenerTiieHaceUnMes } from "../core/mappings";
import { calcular, TIIE_DEFAULT, ADIC_DEFAULT } from "../core/calculations";
import { getFamiliaModelo, GASTOS_OPERATIVOS_FLOTAS } from "../data/gastosOperativos";

export function useCalculator() {
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
  const [precioNegociadoInput, setPrecioNegociadoInput] = useState("");
  const [isanOvr, setIsanOvr] = useState("");

  const [expandCargos, setExpandCargos] = useState(false);
  const [expandGastosOpExt, setExpandGastosOpExt] = useState(false);
  const [expandCuotas, setExpandCuotas] = useState(false);

  const [comisiones, setComisiones] = useState([
    { id: 1, nombre: "Vendedor", valor: "", modo: "pct" },
  ]);
  const [gastosOpExt, setGastosOpExt] = useState([
    { id: 1, nombre: "", valor: "" },
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

  let descFijo = 0;
  if (categoriaSeleccionada === "A") descFijo = 0.03;
  else if (categoriaSeleccionada === "AA") descFijo = 0.05;
  else if (categoriaSeleccionada === "AAA") descFijo = 0.07;

  const pF = m ? baseParaDescuento * (1 - descFijo) : 0;
  const esAAA = categoriaSeleccionada === "AAA";

  const precioNegociado = (esAAA && precioNegociadoInput !== "") ? parseFloat(precioNegociadoInput) : pF;
  const descuentoAdicional = pF > 0 ? ((pF - precioNegociado) / pF) : 0;

  const iOvr = isanOvr !== "" ? parseFloat(isanOvr) : undefined;
  const tiie = tiieInput !== "" ? parseFloat(tiieInput) / 100 : TIIE_DEFAULT;
  const adic = adicInput !== "" ? parseFloat(adicInput) / 100 : ADIC_DEFAULT;
  const safeNum = num === "" ? 0 : parseInt(num, 10) || 0;
  const safePlazo = plazo === "" ? 0 : parseInt(plazo, 10) || 0;

  const familiaModelo = getFamiliaModelo(modeloSeleccionado);
  const gastosOpExtBloqueados = m ? !familiaModelo : false;

  const rBase = useMemo(() => {
    if (!m || !pF) return null;
    return calcular({ m, num: safeNum, plazo: safePlazo, bc, precio: precioNegociado, categoriaSeleccionada, isanOvr: iOvr, totalComisiones: 0, totalGastosOpExt: 0, tiie, adic });
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

  const totalGastosOpExt = useMemo(() => {
    return gastosOpExt.reduce((acc, g) => {
      const v = parseFloat(g.valor) || 0;
      if (Number.isNaN(v)) return acc;
      return acc + v;
    }, 0);
  }, [gastosOpExt]);

  const r = useMemo(() => {
    if (!m || !pF) return null;
    return calcular({ m, num: safeNum, plazo: safePlazo, bc, precio: precioNegociado, categoriaSeleccionada, isanOvr: iOvr, totalComisiones, totalGastosOpExt, tiie, adic });
  }, [m, safeNum, safePlazo, bc, pF, precioNegociado, categoriaSeleccionada, iOvr, totalComisiones, totalGastosOpExt, tiie, adic]);

  return {
    state: {
      dark, loadingDb, modelosData, vigenciaDB, cliente, num, plazo, bc,
      tiieInput, fechaTiieAplicada, adicInput, modeloSeleccionado,
      categoriaSeleccionada, precioNegociadoInput, isanOvr,
      expandCargos, expandGastosOpExt, expandCuotas,
      comisiones, gastosOpExt
    },
    actions: {
      setDark, setCliente, setNum, setPlazo, setBC, setTiieInput, setAdicInput,
      setModeloSeleccionado, setCategoriaSeleccionada, setPrecioNegociadoInput,
      setIsanOvr, setExpandCargos, setExpandGastosOpExt, setExpandCuotas,
      setComisiones, setGastosOpExt, nextId
    },
    computed: {
      m, pF, esAAA, precioNegociado, descuentoAdicional, safeNum, safePlazo,
      totalComisiones, totalGastosOpExt, r, descFijo, familiaModelo, gastosOpExtBloqueados
    }
  };
}
