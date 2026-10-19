// Gera um ano de lançamentos de exemplo (marcados com exemplo: true), reprodutível pela semente.
import { SERVICOS_REFERENCIA } from "./defaults.js";
import { novoId } from "./store.js";

const FIXOS = [
  { categoriaId: "c_aluguel", descricao: "Aluguel da sala", valor: 90000 },
  { categoriaId: "c_internet_e_telefone", descricao: "Internet e celular", valor: 12000 },
  { categoriaId: "c_honorarios_contador", descricao: "Honorários do contador", valor: 35000 },
];

function mulberry32(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const doisDigitos = (n) => String(n).padStart(2, "0");

export function gerarExemplo(doc, ano, semente = 2026) {
  const aleatorio = mulberry32(semente);
  const entre = (min, max) => min + Math.floor(aleatorio() * (max - min + 1));
  const escolher = (lista) => lista[Math.floor(aleatorio() * lista.length)];

  const ativas = (tipo) => doc.categorias.filter((c) => c.tipo === tipo && c.ativa);
  const idsFixos = new Set(FIXOS.map((f) => f.categoriaId));
  const fixos = FIXOS.filter((f) => doc.categorias.some((c) => c.id === f.categoriaId));
  const variaveis = ativas("custo").filter((c) => !idsFixos.has(c.id));
  const receitas = ativas("receita");

  const lista = [];
  const lancar = (tipo, mes, dia, categoriaId, descricao, valor) => lista.push({
    id: novoId("l"), tipo, data: `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`,
    categoriaId, descricao, valor, exemplo: true,
  });

  for (let mes = 1; mes <= 12; mes++) {
    for (const f of fixos) lancar("custo", mes, 5, f.categoriaId, f.descricao, f.valor);
    const nCustos = entre(6, 10) - fixos.length;
    for (let i = 0; i < nCustos && variaveis.length; i++) {
      const cat = escolher(variaveis);
      lancar("custo", mes, entre(1, 28), cat.id, cat.nome, entre(50, 600) * 100);
    }
    const nReceitas = entre(4, 6);
    for (let i = 0; i < nReceitas && receitas.length; i++) {
      lancar("receita", mes, entre(1, 28), escolher(receitas).id, escolher(SERVICOS_REFERENCIA), entre(150, 1200) * 100);
    }
  }
  return lista;
}

export function removerExemplos(doc) {
  return { ...doc, lancamentos: doc.lancamentos.filter((l) => !l.exemplo) };
}
