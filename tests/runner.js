// Mini-executor de testes sem dependências. Funciona no navegador (testes.html) e no jsc (testar.sh).
const testes = [];

export function test(nome, fn) {
  testes.push({ nome, fn });
}

function mostrar(v) {
  try { return JSON.stringify(v); } catch { return String(v); }
}

export function assert(condicao, msg = "condição falsa") {
  if (!condicao) throw new Error(msg);
}

export function assertEqual(atual, esperado, msg = "") {
  if (atual !== esperado) {
    throw new Error(`${msg ? msg + ": " : ""}esperado ${mostrar(esperado)}, obtido ${mostrar(atual)}`);
  }
}

function igualProfundo(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => igualProfundo(a[k], b[k]));
}

export function assertDeepEqual(atual, esperado, msg = "") {
  if (!igualProfundo(atual, esperado)) {
    throw new Error(`${msg ? msg + ": " : ""}esperado ${mostrar(esperado)}, obtido ${mostrar(atual)}`);
  }
}

export function assertThrows(fn, msg = "esperava uma exceção") {
  try { fn(); } catch { return; }
  throw new Error(msg);
}

export function run() {
  let passou = 0;
  const falhas = [];
  for (const t of testes) {
    try { t.fn(); passou++; }
    catch (e) { falhas.push({ nome: t.nome, erro: e.message }); }
  }
  return { passou, falhou: falhas.length, falhas };
}
