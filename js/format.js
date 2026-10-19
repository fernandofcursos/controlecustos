// Conversões entre texto digitado, centavos e datas. Valores monetários são sempre inteiros em centavos.

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// "1.234,56" | "1234,56" | "1234.56" | "R$ 50" -> centavos; inválido ou <= 0 -> null
export function parseReais(texto) {
  if (typeof texto !== "string") return null;
  let t = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (t === "" || t.includes("-")) return null;
  if (t.includes(",")) {
    if (t.split(",").length > 2) return null;
    t = t.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const centavos = Math.round(Number(t) * 100);
  return centavos > 0 ? centavos : null;
}

export function formatMoeda(centavos) {
  const texto = moeda.format(Math.abs(centavos) / 100).replace(/ /g, " ");
  return centavos < 0 ? "-" + texto : texto;
}

export function formatData(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

// Data local de hoje como "aaaa-mm-dd" (sem passar por UTC).
export function hojeISO(agora = new Date()) {
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${m}-${d}`;
}

export function anoDe(iso) {
  return Number(iso.split("-")[0]);
}

export function mesDe(iso) {
  return Number(iso.split("-")[1]);
}
