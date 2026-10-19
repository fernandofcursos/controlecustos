// Cálculos puros sobre o documento (sem DOM, sem armazenamento). Valores em centavos.
// Equivalem às fórmulas da planilha: C4/D4/E4 de cada mês e a aba Resumo.
import { anoDe, mesDe } from "./format.js";

function doAno(doc, ano) {
  return doc.lancamentos.filter((l) => anoDe(l.data) === ano);
}

function somaMes(lancsAno, mes, tipo) {
  let total = 0;
  for (const l of lancsAno) if (l.tipo === tipo && mesDe(l.data) === mes) total += l.valor;
  return total;
}

function temDados(doc, ano) {
  return String(ano) in doc.anos || doc.lancamentos.some((l) => anoDe(l.data) === ano);
}

// Os 12 meses do ano, com o saldo transportado de um mês para o seguinte.
function meses(doc, ano) {
  const lancs = doAno(doc, ano);
  let saldo = saldoAbertura(doc, ano).valor;
  const lista = [];
  for (let mes = 1; mes <= 12; mes++) {
    const receitas = somaMes(lancs, mes, "receita");
    const despesas = somaMes(lancs, mes, "custo");
    const saldoAnterior = saldo;
    saldo = saldoAnterior + receitas - despesas;
    lista.push({ mes, saldoAnterior, receitas, despesas, saldoFinal: saldo });
  }
  return lista;
}

export function saldoAbertura(doc, ano) {
  if (temDados(doc, ano - 1)) {
    return { valor: meses(doc, ano - 1)[11].saldoFinal, herdado: true };
  }
  return { valor: doc.anos[String(ano)]?.saldoAbertura ?? 0, herdado: false };
}

export function resumoMes(doc, ano, mes) {
  const { saldoAnterior, receitas, despesas, saldoFinal } = meses(doc, ano)[mes - 1];
  return { saldoAnterior, receitas, despesas, saldoFinal };
}

export function resumoAno(doc, ano) {
  const lista = meses(doc, ano);
  const totalReceitas = lista.reduce((s, m) => s + m.receitas, 0);
  const totalDespesas = lista.reduce((s, m) => s + m.despesas, 0);
  const lucro = totalReceitas - totalDespesas;
  return {
    totalReceitas,
    totalDespesas,
    lucro,
    margem: totalReceitas === 0 ? 0 : lucro / totalReceitas,
    saldoAcumulado: lista[11].saldoFinal,
    meses: lista.map(({ mes, receitas, despesas, saldoFinal }) => ({ mes, receitas, despesas, lucro: receitas - despesas, saldoFinal })),
  };
}

export function porCategoria(doc, ano, tipo) {
  const totais = new Map();
  for (const l of doAno(doc, ano)) {
    if (l.tipo === tipo) totais.set(l.categoriaId, (totais.get(l.categoriaId) ?? 0) + l.valor);
  }
  const soma = [...totais.values()].reduce((s, v) => s + v, 0);
  const nomes = new Map(doc.categorias.map((c) => [c.id, c.nome]));
  return [...totais]
    .filter(([, total]) => total > 0)
    .map(([categoriaId, total]) => ({ categoriaId, nome: nomes.get(categoriaId) ?? "(sem categoria)", total, pct: soma === 0 ? 0 : total / soma }))
    .sort((a, b) => b.total - a.total);
}

export function lancamentosDoMes(doc, ano, mes, filtro = "todos") {
  return doc.lancamentos
    .filter((l) => anoDe(l.data) === ano && mesDe(l.data) === mes && (filtro === "todos" || l.tipo === filtro))
    .sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
}

export function anosDisponiveis(doc, anoAtual) {
  const anos = new Set([anoAtual, ...Object.keys(doc.anos).map(Number), ...doc.lancamentos.map((l) => anoDe(l.data))]);
  return [...anos].sort((a, b) => a - b);
}
