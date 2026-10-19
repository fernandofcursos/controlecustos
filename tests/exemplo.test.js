import { test, assert, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { gerarExemplo, removerExemplos } from "../js/exemplo.js";
import { validarBackup } from "../js/backup.js";
import { anoDe, mesDe } from "../js/format.js";

test("exemplo: quantidades por mês e marcação", () => {
  const ls = gerarExemplo(criarDocumentoInicial(), 2026);
  for (let m = 1; m <= 12; m++) {
    const r = ls.filter((l) => mesDe(l.data) === m && l.tipo === "receita").length;
    const c = ls.filter((l) => mesDe(l.data) === m && l.tipo === "custo").length;
    assert(r >= 4 && r <= 6 && c >= 6 && c <= 10, `mês ${m}: ${r} receitas, ${c} custos`);
  }
  assert(ls.every((l) => l.exemplo === true && anoDe(l.data) === 2026));
  assert(["c_aluguel", "c_internet_e_telefone", "c_honorarios_contador"].every((id) => ls.filter((l) => l.categoriaId === id).length === 12));
});

test("exemplo gera lançamentos válidos", () => {
  const d = criarDocumentoInicial();
  d.lancamentos = gerarExemplo(d, 2026);
  assertEqual(validarBackup(JSON.stringify(d)).ok, true);
});

test("exemplo não altera o documento", () => {
  const d = criarDocumentoInicial();
  gerarExemplo(d, 2026);
  assertEqual(d.lancamentos.length, 0);
});

test("exemplo é reprodutível com a mesma semente", () => {
  const sem = (ls) => ls.map(({ id, ...resto }) => resto);
  assertDeepEqual(sem(gerarExemplo(criarDocumentoInicial(), 2026)), sem(gerarExemplo(criarDocumentoInicial(), 2026)));
});

test("removerExemplos preserva os dados do aluno", () => {
  const d = criarDocumentoInicial();
  const meu = { id: "l_meu", tipo: "custo", data: "2026-03-01", categoriaId: "c_aluguel", descricao: "", valor: 100, exemplo: false };
  d.lancamentos = [meu, ...gerarExemplo(d, 2026)];
  const r = removerExemplos(d);
  assertDeepEqual(r.lancamentos, [meu]);
  assert(d.lancamentos.length > 1, "original intacto");
});
