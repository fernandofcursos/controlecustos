// Tela Relatório: filtros (ano, mês inicial e final, tipo) e o relatório pronto para imprimir ou salvar em PDF.
import { montarRelatorio } from "../relatorio.js";
import { anosDisponiveis } from "../calc.js";
import { formatMoeda, formatData, hojeISO, anoDe } from "../format.js";
import { esc, NOMES_MESES } from "../ui.js";

const TIPOS = [["todos", "Todos"], ["receita", "Só receitas"], ["custo", "Só custos"]];
const NOME_TIPO = { receita: "Receita", custo: "Custo" };

function opcoes(lista, atual) {
  return lista.map(([v, t]) => `<option value="${v}"${String(v) === String(atual) ? " selected" : ""}>${t}</option>`).join("");
}

function subtotalHtml(m, tipo) {
  const partes = [];
  if (tipo !== "custo") partes.push(`Receitas do mês: <b>${formatMoeda(m.receitas)}</b>`);
  if (tipo !== "receita") partes.push(`Custos do mês: <b>${formatMoeda(m.custos)}</b>`);
  return partes.join(" · ");
}

function mesHtml(m, tipo) {
  const linhas = m.lancamentos.length
    ? m.lancamentos.map((l) => `<tr>
        <td>${formatData(l.data)}</td>
        <td class="rel-${l.tipo}">${NOME_TIPO[l.tipo]}</td>
        <td>${esc(l.categoria)}</td>
        <td>${esc(l.descricao)}</td>
        <td class="rel-valor">${formatMoeda(l.valor)}</td></tr>`).join("")
    : `<tr><td colspan="5" class="rel-vazio">Nenhum lançamento neste mês.</td></tr>`;
  return `<section class="rel-mes">
    <h3>${m.nome}</h3>
    <table class="rel-tabela">
      <thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th class="rel-valor">Valor</th></tr></thead>
      <tbody>${linhas}</tbody>
      <tfoot><tr><td colspan="5" class="rel-subtotal">${subtotalHtml(m, tipo)}</td></tr></tfoot>
    </table>
  </section>`;
}

function resumoHtml(t) {
  const linha = (rotulo, valor, classe = "") => `<tr><th>${rotulo}</th><td class="rel-valor ${classe}">${formatMoeda(valor)}</td></tr>`;
  return `<section class="rel-resumo">
    <h3>Resumo do período</h3>
    <table class="rel-tabela">
      ${linha("Saldo no início do período", t.saldoInicial)}
      ${linha("(+) Total de receitas", t.receitas, "rel-receita")}
      ${linha("(−) Total de custos", t.custos, "rel-custo")}
      ${linha("(=) Resultado do período", t.resultado, t.resultado < 0 ? "rel-custo" : "rel-receita")}
      ${linha("Saldo no fim do período", t.saldoFinal)}
    </table>
  </section>`;
}

export function render(container, { store, estado, render: rerender }) {
  const doc = store.get();
  estado.relatorio ??= { ano: estado.ano, mesInicio: estado.mes, mesFim: estado.mes, tipo: "todos" };
  const f = estado.relatorio;
  const anos = anosDisponiveis(doc, anoDe(hojeISO()));
  if (!anos.includes(f.ano)) anos.push(f.ano);
  anos.sort((a, b) => a - b);
  const meses = NOMES_MESES.map((n, i) => [i + 1, n]);
  const r = montarRelatorio(doc, f);

  container.innerHTML = `
    <div class="nao-imprimir">
      <div class="cabecalho">
        <a class="botao-icone" href="#resumo" aria-label="Voltar ao Resumo">‹</a>
        <h1>Relatório</h1>
        <span style="width:40px"></span>
      </div>
      <div class="form rel-filtros">
        <div class="campo"><label for="r-ano">Ano</label><select id="r-ano">${opcoes(anos.map((a) => [a, a]), f.ano)}</select></div>
        <div class="linha-campos">
          <div class="campo"><label for="r-inicio">Mês inicial</label><select id="r-inicio">${opcoes(meses, f.mesInicio)}</select></div>
          <div class="campo"><label for="r-fim">Mês final</label><select id="r-fim">${opcoes(meses, f.mesFim)}</select></div>
        </div>
        <div class="campo"><label for="r-tipo">Lançamentos</label><select id="r-tipo">${opcoes(TIPOS, f.tipo)}</select></div>
        ${r.ok ? "" : `<p class="erro-relatorio" role="alert">${r.erro}</p>`}
        <button type="button" class="botao botao-primario" data-imprimir${r.ok ? "" : " disabled"}>Imprimir / Salvar PDF</button>
        <p class="dica">Para gerar o PDF, escolha <b>Salvar como PDF</b> na janela de impressão. No iPhone: <b>Compartilhar → Imprimir</b> e, na prévia, compartilhe o PDF.</p>
      </div>
      ${r.ok ? `<h2>Prévia</h2>` : ""}
    </div>
    ${r.ok ? `<article class="relatorio">
      <header class="rel-cabecalho">
        <h2>${r.titulo}</h2>
        <p>${r.subtitulo} · Emitido em ${formatData(hojeISO())}</p>
        <p>Centro de Educação Profissional de Santa Maria — Curso de Administração</p>
      </header>
      ${r.meses.map((m) => mesHtml(m, r.tipo)).join("")}
      ${resumoHtml(r.totais)}
    </article>` : ""}`;

  const ligar = (id, campo) => container.querySelector(id).addEventListener("change", (ev) => {
    f[campo] = campo === "tipo" ? ev.target.value : Number(ev.target.value);
    rerender();
  });
  ligar("#r-ano", "ano");
  ligar("#r-inicio", "mesInicio");
  ligar("#r-fim", "mesFim");
  ligar("#r-tipo", "tipo");
  container.querySelector("[data-imprimir]").addEventListener("click", () => window.print());
}
