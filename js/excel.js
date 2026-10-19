// Exporta um ano no mesmo formato da planilha original (Resumo, Categorias, Jan–Dez). Usa a global XLSX (SheetJS).
import { resumoAno, resumoMes, porCategoria, lancamentosDoMes } from "./calc.js";
import { formatData } from "./format.js";
import { NOMES_MESES, MESES_CURTOS } from "./ui.js";

const CREDITO = "Centro de Educação Profissional de Santa Maria — Curso de Administração";
const reais = (centavos) => centavos / 100;

// Aplica formato de moeda a todas as células numéricas (e % às indicadas).
function folha(linhas, larguras, celulasPct = []) {
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  for (const [ref, cel] of Object.entries(ws)) {
    if (ref[0] !== "!" && cel.t === "n") cel.z = celulasPct.includes(ref) ? "0%" : "#,##0.00";
  }
  ws["!cols"] = larguras.map((wch) => ({ wch }));
  return ws;
}

function abaMes(doc, ano, mes) {
  const r = resumoMes(doc, ano, mes);
  const nomes = new Map(doc.categorias.map((c) => [c.id, c.nome]));
  const linha = (l) => [formatData(l.data), nomes.get(l.categoriaId) ?? "", l.descricao, reais(l.valor)];
  return folha([
    [`CONTROLE MENSAL DE RECEITAS E DESPESAS — ${NOMES_MESES[mes - 1].toUpperCase()}/${ano}`],
    [CREDITO],
    ["Saldo do mês anterior", "Receitas do mês", "Despesas do mês", "Saldo final do mês"],
    [reais(r.saldoAnterior), reais(r.receitas), reais(r.despesas), reais(r.saldoFinal)],
    [],
    ["RECEITAS"],
    ["Data", "Categoria de Receita", "Descrição", "Valor (R$)"],
    ...lancamentosDoMes(doc, ano, mes, "receita").map(linha),
    [],
    ["CUSTOS"],
    ["Data", "Categoria", "Descrição", "Valor (R$)"],
    ...lancamentosDoMes(doc, ano, mes, "custo").map(linha),
  ], [22, 26, 40, 16]);
}

function abaResumo(doc, ano) {
  const r = resumoAno(doc, ano);
  const categorias = (tipo) => porCategoria(doc, ano, tipo).map((c) => [c.nome, reais(c.total), c.pct]);
  const custos = categorias("custo");
  const receitas = categorias("receita");
  const linhas = [
    [`RESUMO ANUAL — ${ano}`],
    [CREDITO],
    ["Total de Receitas do Ano", reais(r.totalReceitas)],
    ["Total de Despesas do Ano", reais(r.totalDespesas)],
    ["Lucro do Período", reais(r.lucro)],
    ["Margem de Lucro", r.margem],
    ["Saldo Final Acumulado", reais(r.saldoAcumulado)],
    [],
    ["Resultado por Mês"],
    ["Mês", "Receitas", "Despesas", "Lucro", "Saldo Acumulado"],
    ...r.meses.map((m) => [NOMES_MESES[m.mes - 1], reais(m.receitas), reais(m.despesas), reais(m.lucro), reais(m.saldoFinal)]),
    ["Total", reais(r.totalReceitas), reais(r.totalDespesas), reais(r.lucro)],
    [],
    ["Custos por Categoria"],
    ["Categoria", "Total (R$)", "% do Total"],
    ...custos,
    ["Total Geral", reais(r.totalDespesas), custos.length ? 1 : 0],
    [],
    ["Receitas por Categoria"],
    ["Categoria", "Total (R$)", "% do Total"],
    ...receitas,
    ["Total", reais(r.totalReceitas), receitas.length ? 1 : 0],
  ];
  // Células de porcentagem: B6 (margem) e a coluna C dos blocos por categoria.
  const pct = ["B6"];
  linhas.forEach((l, i) => { if (l.length === 3 && typeof l[2] === "number") pct.push(`C${i + 1}`); });
  return folha(linhas, [28, 16, 16, 16, 18], pct);
}

function abaCategorias(doc) {
  const natureza = { fixo: "Fixo", variavel: "Variável" };
  const linha = (c) => [c.nome, natureza[c.natureza] ?? "", c.ativa ? "Sim" : "Não"];
  return folha([
    ["Categoria de Custo", "Tipo", "Ativa"],
    ...doc.categorias.filter((c) => c.tipo === "custo").map(linha),
    [],
    ["Categoria de Receita", "Tipo", "Ativa"],
    ...doc.categorias.filter((c) => c.tipo === "receita").map(linha),
  ], [30, 12, 8]);
}

export function montarPlanilha(doc, ano) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, abaResumo(doc, ano), "Resumo");
  XLSX.utils.book_append_sheet(wb, abaCategorias(doc), "Categorias");
  MESES_CURTOS.forEach((nome, i) => XLSX.utils.book_append_sheet(wb, abaMes(doc, ano, i + 1), nome));
  return wb;
}

export function exportarExcel(doc, ano) {
  XLSX.writeFile(montarPlanilha(doc, ano), `controle-custos-${ano}.xlsx`);
}
