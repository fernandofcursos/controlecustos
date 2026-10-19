// Backup do documento inteiro em JSON, com validação estrita na restauração.
import { anoDe } from "./format.js";
import { dataValida } from "./validacao.js";

const INVALIDO = { ok: false, erro: "Arquivo inválido ou corrompido" };
const TIPOS = ["receita", "custo"];

export function exportarBackup(doc, hojeIso) {
  return { nomeArquivo: `controle-custos-backup-${hojeIso}.json`, conteudo: JSON.stringify(doc, null, 2) };
}

const inteiro = (v) => Number.isInteger(v);
const texto = (v) => typeof v === "string";

function categoriaValida(c) {
  return c && texto(c.id) && texto(c.nome) && TIPOS.includes(c.tipo)
    && [null, "fixo", "variavel"].includes(c.natureza) && typeof c.ativa === "boolean";
}

function lancamentoValido(l, categorias) {
  const cat = l && categorias.get(l.categoriaId);
  return cat && texto(l.id) && TIPOS.includes(l.tipo) && cat.tipo === l.tipo && dataValida(l.data)
    && texto(l.descricao) && inteiro(l.valor) && l.valor > 0 && typeof l.exemplo === "boolean";
}

export function validarBackup(conteudo) {
  let doc;
  try { doc = JSON.parse(conteudo); } catch { return INVALIDO; }
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.versao !== 1) return INVALIDO;
  if (!Array.isArray(doc.categorias) || !Array.isArray(doc.lancamentos)) return INVALIDO;
  if (!doc.anos || typeof doc.anos !== "object" || Array.isArray(doc.anos)) return INVALIDO;
  if (!(doc.ultimoBackup === null || dataValida(doc.ultimoBackup))) return INVALIDO;
  if (!doc.categorias.every(categoriaValida)) return INVALIDO;
  if (!Object.values(doc.anos).every((a) => a && inteiro(a.saldoAbertura))) return INVALIDO;
  const categorias = new Map(doc.categorias.map((c) => [c.id, c]));
  if (!doc.lancamentos.every((l) => lancamentoValido(l, categorias))) return INVALIDO;
  const anos = [...new Set(doc.lancamentos.map((l) => anoDe(l.data)))].sort((a, b) => a - b);
  return { ok: true, doc, resumo: { lancamentos: doc.lancamentos.length, anos } };
}

function diasEntre(isoA, isoB) {
  const [a1, m1, d1] = isoA.split("-").map(Number);
  const [a2, m2, d2] = isoB.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

export function precisaAvisoBackup(doc, hojeIso) {
  if (doc.lancamentos.length === 0) return false;
  return doc.ultimoBackup === null || diasEntre(doc.ultimoBackup, hojeIso) > 30;
}
