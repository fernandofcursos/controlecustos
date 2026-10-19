// Tela Mês: painel do mês (como o topo de cada aba da planilha) e lista de lançamentos.
import { resumoMes, lancamentosDoMes } from "../calc.js";
import { formatMoeda, formatData } from "../format.js";
import { esc, NOMES_MESES } from "../ui.js";

const FILTROS = [["todos", "Todos"], ["receita", "Receitas"], ["custo", "Custos"]];

function itemHtml(l, nomes) {
  const sinal = l.tipo === "receita" ? "+" : "−";
  const classe = l.tipo === "receita" ? "positivo" : "negativo";
  const titulo = l.descricao || nomes.get(l.categoriaId) || "(sem descrição)";
  return `<li><a class="item" href="#lancamento/${encodeURIComponent(l.id)}">
    <span class="item-texto"><span>${esc(titulo)}</span>
      <span class="item-meta">${formatData(l.data)} · ${esc(nomes.get(l.categoriaId) ?? "")}</span></span>
    <span class="item-valor ${classe}">${sinal} ${formatMoeda(l.valor)}</span></a></li>`;
}

function listaHtml(lancs, nomes, vazio) {
  if (!lancs.length) return `<ul class="lista"><li class="vazio">${vazio}</li></ul>`;
  return `<ul class="lista">${lancs.map((l) => itemHtml(l, nomes)).join("")}</ul>`;
}

function cartao(rotulo, valor, classe = "") {
  return `<div class="cartao"><small>${rotulo}</small><strong class="${classe}">${formatMoeda(valor)}</strong></div>`;
}

export function render(container, { store, estado, render: rerender }) {
  const doc = store.get();
  const { ano, mes, filtro } = estado;
  const r = resumoMes(doc, ano, mes);
  const nomes = new Map(doc.categorias.map((c) => [c.id, c.nome]));
  const vazio = "Nenhum lançamento neste mês. Toque em + para lançar.";

  container.innerHTML = `
    <div class="cabecalho">
      <button type="button" class="botao-icone" data-mover="-1" aria-label="Mês anterior">‹</button>
      <h1>${NOMES_MESES[mes - 1]} ${ano}</h1>
      <button type="button" class="botao-icone" data-mover="1" aria-label="Próximo mês">›</button>
    </div>
    <div class="cartoes">
      ${cartao("Saldo do mês anterior", r.saldoAnterior, r.saldoAnterior < 0 ? "negativo" : "")}
      ${cartao("Receitas do mês", r.receitas)}
      ${cartao("Despesas do mês", r.despesas)}
      ${cartao("Saldo final do mês", r.saldoFinal, r.saldoFinal < 0 ? "negativo" : "positivo")}
    </div>
    <div class="chips" role="group" aria-label="Filtrar lançamentos">
      ${FILTROS.map(([v, t]) => `<button type="button" class="chip" data-filtro="${v}" aria-pressed="${filtro === v}">${t}</button>`).join("")}
    </div>
    <div class="mes-colunas">
      <div class="unica">${listaHtml(lancamentosDoMes(doc, ano, mes, filtro), nomes, vazio)}</div>
      <section class="coluna"><h2>Receitas</h2>${listaHtml(lancamentosDoMes(doc, ano, mes, "receita"), nomes, "Nenhuma receita neste mês.")}</section>
      <section class="coluna"><h2>Custos</h2>${listaHtml(lancamentosDoMes(doc, ano, mes, "custo"), nomes, "Nenhum custo neste mês.")}</section>
    </div>`;

  for (const b of container.querySelectorAll("[data-mover]")) {
    b.addEventListener("click", () => {
      const total = estado.ano * 12 + (estado.mes - 1) + Number(b.dataset.mover);
      estado.ano = Math.floor(total / 12);
      estado.mes = (total % 12) + 1;
      rerender();
    });
  }
  for (const b of container.querySelectorAll("[data-filtro]")) {
    b.addEventListener("click", () => { estado.filtro = b.dataset.filtro; rerender(); });
  }
}
