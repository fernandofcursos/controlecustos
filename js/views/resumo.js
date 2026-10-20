// Tela Resumo: equivalente à aba Resumo da planilha, com gráfico.
import { resumoAno, porCategoria } from "../calc.js";
import { formatMoeda } from "../format.js";
import { esc, NOMES_MESES, MESES_CURTOS } from "../ui.js";

let grafico = null;

const pct = (v) => `${(v * 100).toFixed(0)}%`;
const classeSaldo = (v) => (v < 0 ? "negativo" : "");

function cartao(rotulo, valor, classe = "") {
  return `<div class="cartao"><small>${rotulo}</small><strong class="${classe}">${valor}</strong></div>`;
}

function categoriasHtml(itens, vazio) {
  if (!itens.length) return `<ul class="lista"><li class="vazio">${vazio}</li></ul>`;
  return `<ul class="lista">${itens.map((c) => `
    <li class="barra-item">
      <div class="barra-linha"><span>${esc(c.nome)}</span><span>${formatMoeda(c.total)} · ${pct(c.pct)}</span></div>
      <div class="barra"><div style="width:${(c.pct * 100).toFixed(1)}%"></div></div>
    </li>`).join("")}</ul>`;
}

function desenharGrafico(canvas, meses) {
  if (grafico) grafico.destroy();
  grafico = null;
  if (typeof Chart === "undefined") return;
  const css = getComputedStyle(document.documentElement);
  const cor = (nome) => css.getPropertyValue(nome).trim();
  Chart.defaults.color = cor("--texto-2");
  grafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels: MESES_CURTOS,
      datasets: [
        { label: "Receitas", data: meses.map((m) => m.receitas / 100), backgroundColor: cor("--positivo") },
        { label: "Despesas", data: meses.map((m) => m.despesas / 100), backgroundColor: cor("--negativo") },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatMoeda(Math.round(c.parsed.y * 100))}` } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: cor("--borda") }, ticks: { callback: (v) => formatMoeda(v * 100).replace(",00", "") } },
      },
    },
  });
}

export function render(container, { store, estado, render: rerender }) {
  const doc = store.get();
  const ano = estado.ano;
  const r = resumoAno(doc, ano);
  const totalLucro = r.meses.reduce((s, m) => s + m.lucro, 0);

  container.innerHTML = `
    <div class="cabecalho">
      <button type="button" class="botao-icone" data-ano="-1" aria-label="Ano anterior">‹</button>
      <h1>Resumo ${ano}</h1>
      <button type="button" class="botao-icone" data-ano="1" aria-label="Próximo ano">›</button>
    </div>
    <p class="acao-relatorio"><a class="botao" href="#relatorio" data-relatorio>Relatório para imprimir</a></p>
    <div class="cartoes">
      ${cartao("Total de receitas do ano", formatMoeda(r.totalReceitas))}
      ${cartao("Total de despesas do ano", formatMoeda(r.totalDespesas))}
      ${cartao("Lucro do período", formatMoeda(r.lucro), r.lucro < 0 ? "negativo" : "positivo")}
      ${cartao("Margem de lucro", pct(r.margem), r.margem < 0 ? "negativo" : "")}
      ${cartao("Saldo final acumulado", formatMoeda(r.saldoAcumulado), classeSaldo(r.saldoAcumulado))}
    </div>
    <h2>Receitas x despesas por mês</h2>
    <div class="grafico"><canvas aria-label="Gráfico de receitas e despesas por mês" role="img"></canvas></div>
    <div class="resumo-colunas">
      <section><h2>Custos por categoria</h2>${categoriasHtml(porCategoria(doc, ano, "custo"), "Nenhum custo neste ano.")}</section>
      <section><h2>Receitas por categoria</h2>${categoriasHtml(porCategoria(doc, ano, "receita"), "Nenhuma receita neste ano.")}</section>
    </div>
    <h2>Resultado por mês</h2>
    <div class="tabela-rolagem">
      <table class="tabela">
        <thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Lucro</th><th>Saldo acumulado</th></tr></thead>
        <tbody>${r.meses.map((m) => `<tr>
          <td>${NOMES_MESES[m.mes - 1]}</td><td>${formatMoeda(m.receitas)}</td><td>${formatMoeda(m.despesas)}</td>
          <td class="${classeSaldo(m.lucro)}">${formatMoeda(m.lucro)}</td><td class="${classeSaldo(m.saldoFinal)}">${formatMoeda(m.saldoFinal)}</td></tr>`).join("")}
        </tbody>
        <tfoot><tr><th>Total</th><th>${formatMoeda(r.totalReceitas)}</th><th>${formatMoeda(r.totalDespesas)}</th><th>${formatMoeda(totalLucro)}</th><th></th></tr></tfoot>
      </table>
    </div>`;

  desenharGrafico(container.querySelector("canvas"), r.meses);
  for (const b of container.querySelectorAll("[data-ano]")) {
    b.addEventListener("click", () => { estado.ano += Number(b.dataset.ano); rerender(); });
  }
  // O relatório abre no mesmo ano que está aparecendo no Resumo.
  container.querySelector("[data-relatorio]").addEventListener("click", () => {
    if (estado.relatorio) estado.relatorio.ano = estado.ano;
  });
}
