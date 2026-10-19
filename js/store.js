// Única porta de acesso ao armazenamento. Toda mutação salva e avisa os assinantes.
import { criarDocumentoInicial } from "./defaults.js";

const CHAVE = "controleCustos.v1";

export function novoId(prefixo) {
  return `${prefixo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function carregar(storage) {
  try {
    const texto = storage.getItem(CHAVE);
    if (texto) {
      const doc = JSON.parse(texto);
      if (doc && doc.versao === 1) return doc;
    }
  } catch {
    // armazenamento indisponível ou JSON corrompido: começa do zero
  }
  return criarDocumentoInicial();
}

export function createStore(storage = globalThis.localStorage) {
  let doc = carregar(storage);
  const assinantes = new Set();

  function save() {
    try {
      storage.setItem(CHAVE, JSON.stringify(doc));
      return true;
    } catch {
      return false;
    }
  }

  function mudou() {
    const ok = save();
    for (const fn of assinantes) fn(doc, ok);
  }

  return {
    get: () => doc,
    save,
    subscribe(fn) {
      assinantes.add(fn);
      return () => assinantes.delete(fn);
    },
    addLancamento(dados) {
      const l = { ...dados, id: novoId("l") };
      doc.lancamentos.push(l);
      mudou();
      return l;
    },
    updateLancamento(id, patch) {
      doc.lancamentos = doc.lancamentos.map((l) => (l.id === id ? { ...l, ...patch, id } : l));
      mudou();
    },
    removeLancamento(id) {
      doc.lancamentos = doc.lancamentos.filter((l) => l.id !== id);
      mudou();
    },
    addCategoria({ nome, tipo, natureza = null }) {
      const c = { id: novoId(tipo === "receita" ? "r" : "c"), nome, tipo, natureza, ativa: true };
      doc.categorias.push(c);
      mudou();
      return c;
    },
    updateCategoria(id, patch) {
      doc.categorias = doc.categorias.map((c) => (c.id === id ? { ...c, ...patch, id } : c));
      mudou();
    },
    removeCategoria(id) {
      if (doc.lancamentos.some((l) => l.categoriaId === id)) throw new Error("Categoria em uso");
      doc.categorias = doc.categorias.filter((c) => c.id !== id);
      mudou();
    },
    setSaldoAbertura(ano, centavos) {
      doc.anos[String(ano)] = { ...doc.anos[String(ano)], saldoAbertura: centavos };
      mudou();
    },
    replaceAll(novo) {
      doc = novo;
      mudou();
    },
    marcarBackup(isoData) {
      doc.ultimoBackup = isoData;
      mudou();
    },
  };
}
