import { test, assertEqual, assertDeepEqual } from "./runner.js";
import { criarDocumentoInicial } from "../js/defaults.js";
import { exportarBackup, validarBackup, precisaAvisoBackup } from "../js/backup.js";

const lanc = { id: "l_1", tipo: "custo", data: "2026-03-12", categoriaId: "c_aluguel", descricao: "Sala", valor: 90000, exemplo: false };
const d = { ...criarDocumentoInicial(), lancamentos: [lanc, { ...lanc, id: "l_2", data: "2027-01-02" }], anos: { 2026: { saldoAbertura: 100 } } };
const INVALIDO = { ok: false, erro: "Arquivo inválido ou corrompido" };

test("backup: nome do arquivo", () => {
  assertEqual(exportarBackup(d, "2026-10-19").nomeArquivo, "controle-custos-backup-2026-10-19.json");
});

test("backup ida e volta é idêntico", () => {
  const { conteudo } = exportarBackup(d, "2026-10-19");
  const r = validarBackup(conteudo);
  assertEqual(r.ok, true);
  assertDeepEqual(r.doc, d);
  assertDeepEqual(r.resumo, { lancamentos: 2, anos: [2026, 2027] });
});

test("backup inválido rejeitado", () => {
  const casos = [
    "{", "[]", "null", "",
    JSON.stringify({ ...d, versao: 2 }),
    JSON.stringify({ ...d, lancamentos: [{ ...lanc, categoriaId: "nao_existe" }] }),
    JSON.stringify({ ...d, lancamentos: [{ ...lanc, categoriaId: "r_servicos_prestados" }] }),
    JSON.stringify({ ...d, lancamentos: [{ ...lanc, valor: 10.5 }] }),
    JSON.stringify({ ...d, lancamentos: [{ ...lanc, valor: -1 }] }),
    JSON.stringify({ ...d, lancamentos: [{ ...lanc, data: "12/03/2026" }] }),
    JSON.stringify({ ...d, categorias: "x" }),
    JSON.stringify({ ...d, anos: { 2026: { saldoAbertura: "100" } } }),
  ];
  for (const t of casos) assertDeepEqual(validarBackup(t), INVALIDO, t.slice(0, 60));
});

test("aviso de backup após 30 dias", () => {
  assertEqual(precisaAvisoBackup(criarDocumentoInicial(), "2026-10-19"), false);
  assertEqual(precisaAvisoBackup({ ...d, ultimoBackup: null }, "2026-10-19"), true);
  assertEqual(precisaAvisoBackup({ ...d, ultimoBackup: "2026-09-18" }, "2026-10-19"), true);
  assertEqual(precisaAvisoBackup({ ...d, ultimoBackup: "2026-09-20" }, "2026-10-19"), false);
});
