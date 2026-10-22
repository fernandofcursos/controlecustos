import { test, assert, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { montarPlanilha } from "../js/excel.js";

const dComMarco = {
  ...criarDocumentoInicial(),
  lancamentos: [
    { id: "a", tipo: "receita", data: "2026-03-01", categoriaId: "r_servicos_prestados", descricao: "Oficina", valor: 100000, exemplo: false },
    { id: "b", tipo: "custo", data: "2026-03-02", categoriaId: "c_aluguel", descricao: "Sala", valor: 30000, exemplo: false },
  ],
};

test("planilha tem 14 abas e valores em reais", () => {
  const wb = montarPlanilha(dComMarco, 2026);
  assertDeepEqual(wb.SheetNames, ["Resumo", "Categorias", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]);
  const mar = XLSX.utils.sheet_to_json(wb.Sheets["Mar"], { header: 1 });
  assert(mar.some((l) => l.includes("Saldo final do mês")), "rótulo do painel");
  assert(mar.flat().includes(700), "saldo final em reais");
  assert(mar.some((l) => l.includes("Oficina") && l.includes(1000)), "linha de receita");
  assert(mar.some((l) => l.includes("Sala") && l.includes(300) && l.includes("Aluguel")), "linha de custo");
});

test("aba Resumo traz totais do ano e categorias", () => {
  const res = XLSX.utils.sheet_to_json(montarPlanilha(dComMarco, 2026).Sheets["Resumo"], { header: 1 });
  assert(res.some((l) => l[0] === "Lucro do Período" && l[1] === 700), "lucro");
  assert(res.some((l) => l[0] === "Margem de Lucro" && l[1] === 0.7), "margem");
  assert(res.some((l) => l[0] === "Aluguel" && l[1] === 300), "custo por categoria");
});

test("planilha traz o crédito institucional novo", () => {
  const res = XLSX.utils.sheet_to_json(montarPlanilha(dComMarco, 2026).Sheets["Resumo"], { header: 1 });
  assertEqual(res[1][0], "Gestão Empresarial · CEP Escola Técnica de Santa Maria");
});
