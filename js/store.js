// Única porta de acesso ao armazenamento. Toda mutação salva e avisa os assinantes.
import { criarDocumentoInicial } from "./defaults.js";

const CHAVE = "controleCustos.v1";

export function novoId(prefixo) {
  return `${prefixo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Em alguns navegadores (dados de sites bloqueados), só acessar window.localStorage já lança erro.
function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function lerTexto(storage) {
  try {
    return storage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(texto) {
  try {
    const doc = JSON.parse(texto);
    if (doc && doc.versao === 1) return doc;
  } catch {
    // JSON corrompido
  }
  return null;
}

export function createStore(storage = armazenamentoPadrao()) {
  let ultimoTexto = lerTexto(storage);
  let doc = (ultimoTexto && interpretar(ultimoTexto)) || criarDocumentoInicial();
  const assinantes = new Set();

  // Se outra janela/aba do app salvou depois de nós, adota a versão dela antes de mudar algo,
  // para não sobrescrever os lançamentos feitos lá.
  function sincronizar() {
    const texto = lerTexto(storage);
    if (texto === null || texto === ultimoTexto) return false;
    ultimoTexto = texto;
    const outro = interpretar(texto);
    if (!outro) return false;
    doc = outro;
    return true;
  }

  function save() {
    try {
      const texto = JSON.stringify(doc);
      storage.setItem(CHAVE, texto);
      ultimoTexto = texto;
      return true;
    } catch {
      return false;
    }
  }

  function avisar(salvou) {
    for (const fn of assinantes) fn(doc, salvou);
  }

  function mudar(fn) {
    sincronizar();
    const resultado = fn();
    avisar(save());
    return resultado;
  }

  return {
    get: () => doc,
    save,
    subscribe(fn) {
      assinantes.add(fn);
      return () => assinantes.delete(fn);
    },
    // Chamado quando outra janela do app altera os dados (evento "storage").
    recarregar() {
      if (sincronizar()) avisar(true);
    },
    addLancamento(dados) {
      return mudar(() => {
        const l = { ...dados, id: novoId("l") };
        doc.lancamentos.push(l);
        return l;
      });
    },
    updateLancamento(id, patch) {
      mudar(() => { doc.lancamentos = doc.lancamentos.map((l) => (l.id === id ? { ...l, ...patch, id } : l)); });
    },
    removeLancamento(id) {
      mudar(() => { doc.lancamentos = doc.lancamentos.filter((l) => l.id !== id); });
    },
    addCategoria({ nome, tipo, natureza = null }) {
      return mudar(() => {
        const c = { id: novoId(tipo === "receita" ? "r" : "c"), nome, tipo, natureza, ativa: true };
        doc.categorias.push(c);
        return c;
      });
    },
    updateCategoria(id, patch) {
      mudar(() => { doc.categorias = doc.categorias.map((c) => (c.id === id ? { ...c, ...patch, id } : c)); });
    },
    removeCategoria(id) {
      sincronizar();
      if (doc.lancamentos.some((l) => l.categoriaId === id)) throw new Error("Categoria em uso");
      mudar(() => { doc.categorias = doc.categorias.filter((c) => c.id !== id); });
    },
    setSaldoAbertura(ano, centavos) {
      mudar(() => { doc.anos[String(ano)] = { ...doc.anos[String(ano)], saldoAbertura: centavos }; });
    },
    replaceAll(novo) {
      mudar(() => { doc = novo; });
    },
    marcarBackup(isoData) {
      mudar(() => { doc.ultimoBackup = isoData; });
    },
  };
}
