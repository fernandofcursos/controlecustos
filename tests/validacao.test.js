import { test, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { validarLancamento } from "../js/validacao.js";

const d = criarDocumentoInicial();

test("validarLancamento ok converte valor", () => {
  const r = validarLancamento({ tipo: "custo", valorTexto: "180,00", data: "2026-03-12", categoriaId: "c_energia_eletrica", descricao: "  Conta de luz " }, d);
  assertDeepEqual(r, { ok: true, lancamento: { tipo: "custo", data: "2026-03-12", categoriaId: "c_energia_eletrica", descricao: "Conta de luz", valor: 18000 } });
});

test("validarLancamento erros com mensagens exatas", () => {
  const r = validarLancamento({ tipo: "custo", valorTexto: "0", data: "2026-02-30", categoriaId: "r_servicos_prestados", descricao: "x".repeat(101) }, d);
  assertEqual(r.ok, false);
  assertDeepEqual(r.erros, {
    valor: "Informe um valor maior que zero",
    data: "Informe uma data válida",
    categoria: "Escolha uma categoria",
    descricao: "Máximo de 100 caracteres",
  });
});

test("validarLancamento: data e categoria vazias", () => {
  const r = validarLancamento({ tipo: "receita", valorTexto: "10", data: "", categoriaId: "", descricao: "" }, d);
  assertDeepEqual(Object.keys(r.erros).sort(), ["categoria", "data"]);
});

test("validarLancamento aceita 29/02 em ano bissexto", () => {
  assertEqual(validarLancamento({ tipo: "receita", valorTexto: "10", data: "2028-02-29", categoriaId: "r_servicos_prestados", descricao: "" }, d).ok, true);
  assertEqual(validarLancamento({ tipo: "receita", valorTexto: "10", data: "2026-13-01", categoriaId: "r_servicos_prestados", descricao: "" }, d).ok, false);
});
