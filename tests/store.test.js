import { test, assert, assertEqual, assertThrows } from "./runner.js";
import { CATEGORIAS_PADRAO, SERVICOS_REFERENCIA, criarDocumentoInicial } from "../js/defaults.js";
import { createStore, novoId } from "../js/store.js";

function fakeStorage() {
  const dados = {};
  return { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = String(v); }, dados };
}

const lanc = { tipo: "custo", data: "2026-03-12", categoriaId: "c_aluguel", descricao: "", valor: 90000, exemplo: false };

test("documento inicial tem 26 custos e 10 receitas", () => {
  const d = criarDocumentoInicial();
  assertEqual(d.versao, 1);
  assertEqual(d.categorias.filter((c) => c.tipo === "custo").length, 26);
  assertEqual(d.categorias.filter((c) => c.tipo === "receita").length, 10);
  assertEqual(SERVICOS_REFERENCIA.length, 12);
  assert(d.categorias.every((c) => c.natureza === null && c.ativa === true));
});

test("ids das categorias padrão são slugs estáveis", () => {
  const ids = CATEGORIAS_PADRAO.map((c) => c.id);
  for (const id of ["c_aluguel", "c_agua_e_saneamento", "c_honorarios_contador", "c_internet_e_telefone", "c_seguros", "r_servicos_prestados", "r_outras_receitas"]) {
    assert(ids.includes(id), id);
  }
  assertEqual(new Set(ids).size, ids.length, "ids únicos");
});

test("documento inicial é uma cópia independente", () => {
  const d = criarDocumentoInicial();
  d.categorias[0].nome = "Mudou";
  assertEqual(criarDocumentoInicial().categorias[0].nome, "Aluguel");
});

test("salva e recarrega", () => {
  const mem = fakeStorage();
  const s = createStore(mem);
  const l = s.addLancamento(lanc);
  assert(l.id.startsWith("l_"));
  assertEqual(createStore(mem).get().lancamentos.length, 1);
  assert("controleCustos.v1" in mem.dados);
});

test("update e remove de lançamento", () => {
  const s = createStore(fakeStorage());
  const l = s.addLancamento(lanc);
  s.updateLancamento(l.id, { valor: 100 });
  assertEqual(s.get().lancamentos[0].valor, 100);
  s.removeLancamento(l.id);
  assertEqual(s.get().lancamentos.length, 0);
});

test("removeCategoria em uso lança erro; sem uso remove", () => {
  const s = createStore(fakeStorage());
  s.addLancamento(lanc);
  assertThrows(() => s.removeCategoria("c_aluguel"));
  s.removeCategoria("c_seguros");
  assertEqual(s.get().categorias.filter((c) => c.tipo === "custo").length, 25);
});

test("addCategoria e updateCategoria", () => {
  const s = createStore(fakeStorage());
  const c = s.addCategoria({ nome: "Kits de robótica", tipo: "custo", natureza: "variavel" });
  assertEqual(c.ativa, true);
  s.updateCategoria(c.id, { nome: "Kits", ativa: false });
  const salvo = s.get().categorias.find((x) => x.id === c.id);
  assertEqual(salvo.nome, "Kits");
  assertEqual(salvo.ativa, false);
});

test("setSaldoAbertura, marcarBackup e replaceAll", () => {
  const s = createStore(fakeStorage());
  s.setSaldoAbertura(2026, 50000);
  assertEqual(s.get().anos["2026"].saldoAbertura, 50000);
  s.marcarBackup("2026-10-19");
  assertEqual(s.get().ultimoBackup, "2026-10-19");
  s.replaceAll(criarDocumentoInicial());
  assertEqual(s.get().ultimoBackup, null);
});

test("JSON corrompido no storage vira documento inicial", () => {
  const mem = fakeStorage();
  mem.setItem("controleCustos.v1", "{quebrado");
  assertEqual(createStore(mem).get().lancamentos.length, 0);
});

test("storage que lança erro: save retorna false e get continua funcionando", () => {
  const ruim = { getItem: () => { throw new Error("SecurityError"); }, setItem: () => { throw new Error("QuotaExceeded"); } };
  const s = createStore(ruim);
  assertEqual(s.get().versao, 1);
  assertEqual(s.save(), false);
  s.addLancamento(lanc);
  assertEqual(s.get().lancamentos.length, 1);
});

test("subscribe é chamado após mutação e pode cancelar", () => {
  const s = createStore(fakeStorage());
  let n = 0;
  const cancelar = s.subscribe(() => n++);
  s.addLancamento(lanc);
  assertEqual(n, 1);
  cancelar();
  s.addLancamento(lanc);
  assertEqual(n, 1);
});

test("novoId gera ids distintos com prefixo", () => {
  const a = novoId("x"), b = novoId("x");
  assert(a.startsWith("x_") && a !== b);
});
