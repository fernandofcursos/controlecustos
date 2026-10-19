import { test, assertEqual } from "./runner.js";
import { parseReais, formatMoeda, formatData, hojeISO, anoDe, mesDe } from "../js/format.js";

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
