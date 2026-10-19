// Tela Categorias: criar, renomear, classificar (Fixo/Variável), ativar/desativar e excluir.
import { erroNomeCategoria } from "../validacao.js";
import { esc, mostrarAviso } from "../ui.js";

const NATUREZAS = [["", "—"], ["fixo", "Fixo"], ["variavel", "Variável"]];

function pedirNome(doc, tipo, atual = "", ignorarId = null) {
  const nome = prompt("Nome da categoria", atual);
  if (nome === null) return null;
  const erro = erroNomeCategoria(doc, tipo, nome, ignorarId);
  if (erro) {
    mostrarAviso(erro, "erro");
    return null;
  }
  return nome.trim();
}

export function render(container, { store, estado, render: rerender }) {
  const doc = store.get();
  const tipo = estado.tipoCategoria ?? "custo";
  const emUso = new Set(doc.lancamentos.map((l) => l.categoriaId));
  const cats = doc.categorias.filter((c) => c.tipo === tipo);

  container.innerHTML = `
    <div class="cabecalho">
      <span style="width:40px"></span>
      <h1>Categorias</h1>
      <button type="button" class="botao-icone" data-nova aria-label="Nova categoria">+</button>
    </div>
    <div class="segmentado" role="group" aria-label="Tipo de categoria">
      <button type="button" class="botao${tipo === "receita" ? " selecionado" : ""}" data-tipo="receita" aria-pressed="${tipo === "receita"}">Receitas</button>
      <button type="button" class="botao${tipo === "custo" ? " selecionado" : ""}" data-tipo="custo" aria-pressed="${tipo === "custo"}">Custos</button>
    </div>
    <ul class="lista categorias">
      ${cats.map((c) => `
        <li class="categoria${c.ativa ? "" : " inativa"}" data-id="${esc(c.id)}">
          <div class="categoria-nome">
            <span>${esc(c.nome)}</span>
            ${c.ativa ? "" : `<span class="item-meta">desativada</span>`}
          </div>
          <div class="categoria-acoes">
            <select aria-label="Natureza de ${esc(c.nome)}" data-natureza>
              ${NATUREZAS.map(([v, t]) => `<option value="${v}"${(c.natureza ?? "") === v ? " selected" : ""}>${t}</option>`).join("")}
            </select>
            <button type="button" class="botao botao-pequeno" data-renomear>Renomear</button>
            <button type="button" class="botao botao-pequeno" data-ativar>${c.ativa ? "Desativar" : "Ativar"}</button>
            ${emUso.has(c.id) ? "" : `<button type="button" class="botao botao-pequeno botao-perigo" data-excluir>Excluir</button>`}
          </div>
        </li>`).join("")}
    </ul>
    <p class="dica">Categorias desativadas somem da lista ao lançar, mas continuam no Resumo. Só dá para excluir categorias sem lançamentos.</p>`;

  for (const b of container.querySelectorAll("[data-tipo]")) {
    b.addEventListener("click", () => { estado.tipoCategoria = b.dataset.tipo; rerender(); });
  }
  container.querySelector("[data-nova]").addEventListener("click", () => {
    const nome = pedirNome(store.get(), tipo);
    if (nome) store.addCategoria({ nome, tipo, natureza: null });
  });
  for (const li of container.querySelectorAll("li[data-id]")) {
    const id = li.dataset.id;
    const cat = cats.find((c) => c.id === id);
    li.querySelector("[data-natureza]").addEventListener("change", (ev) => {
      store.updateCategoria(id, { natureza: ev.target.value || null });
    });
    li.querySelector("[data-renomear]").addEventListener("click", () => {
      const nome = pedirNome(store.get(), tipo, cat.nome, id);
      if (nome) store.updateCategoria(id, { nome });
    });
    li.querySelector("[data-ativar]").addEventListener("click", () => store.updateCategoria(id, { ativa: !cat.ativa }));
    li.querySelector("[data-excluir]")?.addEventListener("click", () => {
      if (confirm(`Excluir a categoria "${cat.nome}"?`)) store.removeCategoria(id);
    });
  }
}
