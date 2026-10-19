// Equivalência com a planilha original: os mesmos lançamentos foram digitados numa cópia de
// "CONTROLE DE CUSTOS - CEP ETSM.xlsx" e as fórmulas dela foram calculadas (pycel). Os valores
// esperados abaixo vieram da planilha (Resumo B3:B7, linhas 11–13, 27–52 e 57–66).
import { test, assert, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { resumoAno, porCategoria } from "../js/calc.js";

const DADOS = [
  ["receita", "2026-01-05", "r_servicos_prestados", 120000],
  ["receita", "2026-01-18", "r_aulas_e_treinamentos", 35050],
  ["custo", "2026-01-05", "c_aluguel", 90000],
  ["custo", "2026-01-10", "c_energia_eletrica", 18735],
  ["custo", "2026-01-22", "c_material_de_escritorio", 4290],
  ["receita", "2026-02-03", "r_venda_de_produtos", 78000],
  ["receita", "2026-02-20", "r_servicos_prestados", 41000],
  ["custo", "2026-02-05", "c_aluguel", 90000],
  ["custo", "2026-02-14", "c_internet_e_telefone", 11990],
  ["custo", "2026-02-25", "c_produtos_e_insumos", 33333],
  ["receita", "2026-03-08", "r_oficinas_e_workshops", 150000],
  ["custo", "2026-03-05", "c_aluguel", 90000],
  ["custo", "2026-03-12", "c_energia_eletrica", 20110],
  ["custo", "2026-03-28", "c_taxas_e_impostos", 7560],
  ["custo", "2026-03-30", "c_honorarios_contador", 25000],
];

const doc = {
  ...criarDocumentoInicial(),
  anos: { 2026: { saldoAbertura: 50000 } },
  lancamentos: DADOS.map(([tipo, data, categoriaId, valor], i) => ({ id: `e${i}`, tipo, data, categoriaId, descricao: "", valor, exemplo: false })),
};

const perto = (a, b) => Math.abs(a - b) < 1e-9;

test("equivalência: totais do ano iguais à planilha", () => {
  const r = resumoAno(doc, 2026);
  assertEqual(r.totalReceitas, 424050);   // B3 = 4240,50
  assertEqual(r.totalDespesas, 391018);   // B4 = 3910,18
  assertEqual(r.lucro, 33032);            // B5 = 330,32
  assert(perto(r.margem, 0.07789647447235), `margem ${r.margem}`); // B6
  assertEqual(r.saldoAcumulado, 83032);   // B7 = 830,32
});

test("equivalência: resultado por mês igual à planilha", () => {
  const meses = resumoAno(doc, 2026).meses.slice(0, 3).map((m) => [m.receitas, m.despesas, m.lucro, m.saldoFinal]);
  assertDeepEqual(meses, [
    [155050, 113025, 42025, 92025],
    [119000, 135323, -16323, 75702],
    [150000, 142670, 7330, 83032],
  ]);
});

test("equivalência: custos e receitas por categoria iguais à planilha", () => {
  const custos = Object.fromEntries(porCategoria(doc, 2026, "custo").map((c) => [c.nome, c]));
  const esperadoCustos = {
    "Aluguel": [270000, 0.6905052964313664], "Energia elétrica": [38845, 0.09934325274028306],
    "Internet e telefone": [11990, 0.030663550015600307], "Honorários contador": [25000, 0.06393567559549689],
    "Produtos e insumos": [33333, 0.0852467149849879], "Material de escritório": [4290, 0.010971361932187266],
    "Taxas e impostos": [7560, 0.019334148300078256],
  };
  assertEqual(Object.keys(custos).length, 7);
  for (const [nome, [total, pct]] of Object.entries(esperadoCustos)) {
    assertEqual(custos[nome].total, total, nome);
    assert(perto(custos[nome].pct, pct), `${nome} pct ${custos[nome].pct}`);
  }
  const receitas = Object.fromEntries(porCategoria(doc, 2026, "receita").map((c) => [c.nome, c]));
  const esperadoReceitas = {
    "Serviços prestados": [161000, 0.37967220846598276], "Venda de produtos": [78000, 0.1839405730456314],
    "Aulas e treinamentos": [35050, 0.08265534724678694], "Oficinas e workshops": [150000, 0.3537318712415989],
  };
  assertEqual(Object.keys(receitas).length, 4);
  for (const [nome, [total, pct]] of Object.entries(esperadoReceitas)) {
    assertEqual(receitas[nome].total, total, nome);
    assert(perto(receitas[nome].pct, pct), `${nome} pct ${receitas[nome].pct}`);
  }
});
