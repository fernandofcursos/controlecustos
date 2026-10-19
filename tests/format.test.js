import { test, assertEqual } from "./runner.js";
import { parseReais, formatMoeda, formatData, hojeISO, anoDe, mesDe, centavosParaTexto, parseSaldo } from "../js/format.js";

test("parseReais aceita formatos pt-BR", () => {
  assertEqual(parseReais("1.234,56"), 123456);
  assertEqual(parseReais("1234,56"), 123456);
  assertEqual(parseReais("1234.56"), 123456);
  assertEqual(parseReais("R$ 50"), 5000);
  assertEqual(parseReais(" 180,00 "), 18000);
  assertEqual(parseReais("0,005"), 1);
});

test("parseReais rejeita inválidos", () => {
  for (const t of ["", "abc", "-50", "0", "0,004", "1,2,3"]) assertEqual(parseReais(t), null, t);
});

test("formatMoeda", () => {
  assertEqual(formatMoeda(123456), "R$ 1.234,56");
  assertEqual(formatMoeda(-18000), "-R$ 180,00");
  assertEqual(formatMoeda(0), "R$ 0,00");
});

test("datas sem fuso", () => {
  assertEqual(mesDe("2026-03-01"), 3);
  assertEqual(anoDe("2027-01-05"), 2027);
  assertEqual(formatData("2026-03-01"), "01/03/2026");
  assertEqual(hojeISO(new Date(2026, 2, 1, 23, 30)), "2026-03-01");
});

test("centavosParaTexto para preencher o formulário", () => {
  assertEqual(centavosParaTexto(123456), "1234,56");
  assertEqual(centavosParaTexto(5), "0,05");
  assertEqual(parseReais(centavosParaTexto(18000)), 18000);
});

test("parseSaldo aceita zero, negativo e vazio", () => {
  assertEqual(parseSaldo(""), 0);
  assertEqual(parseSaldo("0"), 0);
  assertEqual(parseSaldo("-1.500,50"), -150050);
  assertEqual(parseSaldo("R$ 200"), 20000);
  assertEqual(parseSaldo("abc"), null);
  assertEqual(parseSaldo("--5"), null);
});

test("parseReais: ponto como separador de milhar sem vírgula", () => {
  assertEqual(parseReais("1.500"), 150000);
  assertEqual(parseReais("10.000"), 1000000);
  assertEqual(parseReais("1.234.567"), 123456700);
  assertEqual(parseReais("1234.56"), 123456);
  assertEqual(parseReais("1.5"), 150);
  assertEqual(parseReais("1.50"), 150);
});
