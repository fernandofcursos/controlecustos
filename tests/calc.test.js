import { test, assert, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { saldoAbertura, resumoMes, resumoAno, porCategoria, lancamentosDoMes, anosDisponiveis } from "../js/calc.js";

let seq = 0;
function L(tipo, data, valor, categoriaId = tipo === "receita" ? "r_servicos_prestados" : "c_aluguel") {
  return { id: `t${seq++}`, tipo, data, categoriaId, descricao: "", valor, exemplo: false };
}
function doc(lancs = [], anos = {}) {
  return { ...criarDocumentoInicial(), lancamentos: lancs, anos };
}

test("saldo transporta entre meses", () => {
  const d = doc([L("receita", "2026-01-10", 100000), L("custo", "2026-01-20", 30000), L("custo", "2026-02-05", 20000)], { 2026: { saldoAbertura: 50000 } });
  assertDeepEqual(resumoMes(d, 2026, 1), { saldoAnterior: 50000, receitas: 100000, despesas: 30000, saldoFinal: 120000 });
  assertEqual(resumoMes(d, 2026, 2).saldoAnterior, 120000);
  assertEqual(resumoMes(d, 2026, 12).saldoFinal, 100000);
});

test("abertura sem dados do ano anterior usa valor manual ou 0", () => {
  assertDeepEqual(saldoAbertura(doc([], { 2026: { saldoAbertura: 777 } }), 2026), { valor: 777, herdado: false });
  assertDeepEqual(saldoAbertura(doc(), 2026), { valor: 0, herdado: false });
});

test("abertura herdada do ano anterior consecutivo", () => {
  const d = doc([L("receita", "2026-06-01", 10000)], { 2026: { saldoAbertura: 5000 }, 2027: { saldoAbertura: 999 } });
  assertDeepEqual(saldoAbertura(d, 2027), { valor: 15000, herdado: true });
  assertEqual(resumoMes(d, 2027, 1).saldoAnterior, 15000);
});

test("anos não consecutivos não herdam", () => {
  const d = doc([L("receita", "2026-06-01", 10000), L("receita", "2028-01-01", 100)], { 2028: { saldoAbertura: 700 } });
  assertDeepEqual(saldoAbertura(d, 2028), { valor: 700, herdado: false });
});

test("resumoAno totais, lucro, margem e meses", () => {
  const d = doc([L("receita", "2026-03-01", 100000), L("custo", "2026-03-02", 30000)], { 2026: { saldoAbertura: 1000 } });
  const r = resumoAno(d, 2026);
  assertEqual(r.totalReceitas, 100000);
  assertEqual(r.totalDespesas, 30000);
  assertEqual(r.lucro, 70000);
  assertEqual(r.margem, 0.7);
  assertEqual(r.saldoAcumulado, 71000);
  assertEqual(r.meses.length, 12);
  assertDeepEqual(r.meses[2], { mes: 3, receitas: 100000, despesas: 30000, lucro: 70000, saldoFinal: 71000 });
});

test("margem com receita zero é 0", () => {
  assertEqual(resumoAno(doc([L("custo", "2026-03-01", 500)]), 2026).margem, 0);
});

test("porCategoria: pct, ordem e zero", () => {
  const d = doc([L("custo", "2026-01-01", 1000, "c_energia_eletrica"), L("custo", "2026-02-01", 3000, "c_aluguel"), L("receita", "2026-02-01", 9, "r_venda_de_produtos")]);
  const r = porCategoria(d, 2026, "custo");
  assertEqual(r.length, 2);
  assertDeepEqual(r[0], { categoriaId: "c_aluguel", nome: "Aluguel", total: 3000, pct: 0.75 });
  assertEqual(r[1].categoriaId, "c_energia_eletrica");
  assertEqual(r[1].pct, 0.25);
  assertDeepEqual(porCategoria(doc(), 2026, "custo"), []);
});

test("categoria desativada continua no resumo", () => {
  const d = doc([L("custo", "2026-01-01", 1000, "c_aluguel")]);
  d.categorias = d.categorias.map((c) => (c.id === "c_aluguel" ? { ...c, ativa: false } : c));
  assertEqual(porCategoria(d, 2026, "custo")[0].total, 1000);
});

test("lançamento movido para 2027 sai de 2026", () => {
  const l = L("receita", "2026-12-20", 5000);
  const d = doc([l]);
  l.data = "2027-01-05";
  assertEqual(resumoAno(d, 2026).totalReceitas, 0);
  assertEqual(resumoAno(d, 2027).totalReceitas, 5000);
});

test("lancamentosDoMes filtra e ordena por data", () => {
  const d = doc([L("custo", "2026-03-20", 1), L("receita", "2026-03-05", 2), L("custo", "2026-03-01", 3), L("custo", "2026-04-01", 4)]);
  assertDeepEqual(lancamentosDoMes(d, 2026, 3, "todos").map((l) => l.valor), [3, 2, 1]);
  assertDeepEqual(lancamentosDoMes(d, 2026, 3, "custo").map((l) => l.valor), [3, 1]);
  assertDeepEqual(lancamentosDoMes(d, 2026, 3, "receita").map((l) => l.valor), [2]);
});

test("anosDisponiveis", () => {
  assertDeepEqual(anosDisponiveis(doc([L("custo", "2025-05-01", 1)]), 2026), [2025, 2026]);
  assertDeepEqual(anosDisponiveis(doc([L("custo", "2028-05-01", 1)], { 2027: { saldoAbertura: 0 } }), 2026), [2026, 2027, 2028]);
});
