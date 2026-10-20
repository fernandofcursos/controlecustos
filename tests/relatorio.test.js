import { test, assert, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { montarRelatorio } from "../js/relatorio.js";
import { resumoMes } from "../js/calc.js";

let seq = 0;
function L(tipo, data, valor, categoriaId = tipo === "receita" ? "r_servicos_prestados" : "c_aluguel", descricao = "") {
  return { id: `t${seq++}`, tipo, data, categoriaId, descricao, valor, exemplo: false };
}
const doc = {
  ...criarDocumentoInicial(),
  anos: { 2026: { saldoAbertura: 100000 } },
  lancamentos: [
    L("receita", "2026-01-10", 50000),
    L("custo", "2026-03-20", 30000, "c_energia_eletrica", "Luz"),
    L("receita", "2026-03-05", 120000, "r_servicos_prestados", "Suporte"),
    L("custo", "2026-03-05", 9000),
    L("receita", "2026-05-02", 7000),
    L("custo", "2026-07-01", 1000),
    L("receita", "2027-03-01", 99999),
  ],
};

test("relatório: título, subtítulo e meses do período", () => {
  const r = montarRelatorio(doc, { ano: 2026, mesInicio: 3, mesFim: 6, tipo: "todos" });
  assertEqual(r.ok, true);
  assertEqual(r.titulo, "Relatório de lançamentos — Março a Junho de 2026");
  assertEqual(r.subtitulo, "Receitas e custos");
  assertDeepEqual(r.meses.map((m) => m.nome), ["Março de 2026", "Abril de 2026", "Maio de 2026", "Junho de 2026"]);
  assertEqual(r.meses[1].lancamentos.length, 0);
});

test("relatório: título de um único mês", () => {
  assertEqual(montarRelatorio(doc, { ano: 2026, mesInicio: 3, mesFim: 3, tipo: "todos" }).titulo, "Relatório de lançamentos — Março de 2026");
});

test("relatório: linhas em ordem de data com nome da categoria", () => {
  const r = montarRelatorio(doc, { ano: 2026, mesInicio: 3, mesFim: 3, tipo: "todos" });
  assertDeepEqual(r.meses[0].lancamentos.map((l) => [l.data, l.tipo, l.categoria, l.valor]), [
    ["2026-03-05", "receita", "Serviços prestados", 120000],
    ["2026-03-05", "custo", "Aluguel", 9000],
    ["2026-03-20", "custo", "Energia elétrica", 30000],
  ]);
  assertEqual(r.meses[0].lancamentos[0].descricao, "Suporte");
});

test("relatório: filtro por tipo afeta a lista", () => {
  const rec = montarRelatorio(doc, { ano: 2026, mesInicio: 1, mesFim: 12, tipo: "receita" });
  assertEqual(rec.subtitulo, "Somente receitas");
  assert(rec.meses.every((m) => m.lancamentos.every((l) => l.tipo === "receita")));
  assertEqual(rec.meses.flatMap((m) => m.lancamentos).length, 3);
  const cus = montarRelatorio(doc, { ano: 2026, mesInicio: 1, mesFim: 12, tipo: "custo" });
  assertEqual(cus.subtitulo, "Somente custos");
  assertEqual(cus.meses.flatMap((m) => m.lancamentos).length, 3);
});

test("relatório: subtotais do mês e totais do período", () => {
  const r = montarRelatorio(doc, { ano: 2026, mesInicio: 3, mesFim: 5, tipo: "receita" });
  assertEqual(r.meses[0].receitas, 120000);
  assertEqual(r.meses[0].custos, 39000);
  assertDeepEqual(r.totais, {
    saldoInicial: 150000,
    receitas: 127000,
    custos: 39000,
    resultado: 88000,
    saldoFinal: 238000,
  });
});

test("relatório: saldos batem com a tela Mês", () => {
  const r = montarRelatorio(doc, { ano: 2026, mesInicio: 2, mesFim: 7, tipo: "todos" });
  assertEqual(r.totais.saldoInicial, resumoMes(doc, 2026, 2).saldoAnterior);
  assertEqual(r.totais.saldoFinal, resumoMes(doc, 2026, 7).saldoFinal);
});

test("relatório: período inválido", () => {
  assertDeepEqual(montarRelatorio(doc, { ano: 2026, mesInicio: 6, mesFim: 3, tipo: "todos" }),
    { ok: false, erro: "O mês final deve ser igual ou posterior ao mês inicial" });
});

test("relatório: ano sem dados", () => {
  const r = montarRelatorio(criarDocumentoInicial(), { ano: 2030, mesInicio: 1, mesFim: 2, tipo: "todos" });
  assertEqual(r.ok, true);
  assertDeepEqual(r.totais, { saldoInicial: 0, receitas: 0, custos: 0, resultado: 0, saldoFinal: 0 });
});
