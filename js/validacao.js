// Validação do formulário de lançamento (função pura, testável sem DOM).
import { parseReais } from "./format.js";

export function dataValida(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [a, m, d] = iso.split("-").map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= new Date(a, m, 0).getDate();
}

export function validarLancamento({ tipo, valorTexto, data, categoriaId, descricao = "" }, doc) {
  const erros = {};
  const valor = parseReais(valorTexto ?? "");
  if (valor === null) erros.valor = "Informe um valor maior que zero";
  if (!dataValida(data)) erros.data = "Informe uma data válida";
  const categoria = doc.categorias.find((c) => c.id === categoriaId);
  if (!categoria || categoria.tipo !== tipo) erros.categoria = "Escolha uma categoria";
  const texto = descricao.trim();
  if (texto.length > 100) erros.descricao = "Máximo de 100 caracteres";
  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, lancamento: { tipo, data, categoriaId, descricao: texto, valor } };
}

// Nome de categoria: obrigatório, até 40 caracteres, sem repetir dentro do mesmo tipo.
export function erroNomeCategoria(doc, tipo, nome, ignorarId = null) {
  const limpo = nome.trim();
  if (!limpo) return "Informe um nome";
  if (limpo.length > 40) return "Máximo de 40 caracteres";
  const repetido = doc.categorias.some((c) => c.tipo === tipo && c.id !== ignorarId && c.nome.toLowerCase() === limpo.toLowerCase());
  return repetido ? "Já existe uma categoria com esse nome" : null;
}
