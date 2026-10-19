// Tela Lançamento: criar (#lancamento) ou editar (#lancamento/<id>) uma receita ou um custo.
import { validarLancamento } from "../validacao.js";
import { hojeISO, anoDe, mesDe, centavosParaTexto } from "../format.js";
import { SERVICOS_REFERENCIA } from "../defaults.js";
import { esc } from "../ui.js";

function dataPadrao({ ano, mes }) {
  const hoje = hojeISO();
  if (anoDe(hoje) === ano && mesDe(hoje) === mes) return hoje;
  return `${ano}-${String(mes).padStart(2, "0")}-01`;
}

function opcoesCategoria(doc, tipo, selecionada) {
  const cats = doc.categorias.filter((c) => c.tipo === tipo && (c.ativa || c.id === selecionada));
  return `<option value="">Escolha…</option>` + cats
    .map((c) => `<option value="${esc(c.id)}"${c.id === selecionada ? " selected" : ""}>${esc(c.nome)}${c.ativa ? "" : " (desativada)"}</option>`)
    .join("");
}

export function render(container, { store, estado, rota }) {
  const doc = store.get();
  const existente = rota.id ? doc.lancamentos.find((l) => l.id === rota.id) : null;
  if (rota.id && !existente) {
    container.innerHTML = `<p class="vazio">Este lançamento não existe mais.</p><p><a class="botao" href="#mes">Voltar ao mês</a></p>`;
    return;
  }
  const v = existente ?? { tipo: "custo", data: dataPadrao(estado), categoriaId: "", descricao: "", valor: null };

  container.innerHTML = `
    <div class="cabecalho">
      <a class="botao-icone" href="#mes" aria-label="Cancelar">✕</a>
      <h1>${existente ? "Editar lançamento" : "Novo lançamento"}</h1>
      <span style="width:40px"></span>
    </div>
    <form class="form" novalidate>
      <div class="segmentado" role="radiogroup" aria-label="Tipo">
        <label><input type="radio" name="tipo" value="receita"${v.tipo === "receita" ? " checked" : ""}><span>Receita</span></label>
        <label><input type="radio" name="tipo" value="custo"${v.tipo === "custo" ? " checked" : ""}><span>Custo</span></label>
      </div>
      <div class="campo campo-valor">
        <label for="f-valor">Valor (R$)</label>
        <input id="f-valor" name="valor" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${v.valor ? centavosParaTexto(v.valor) : ""}">
        <span class="erro" data-erro="valor"></span>
      </div>
      <div class="campo">
        <label for="f-data">Data</label>
        <input id="f-data" name="data" type="date" value="${esc(v.data)}">
        <span class="erro" data-erro="data"></span>
      </div>
      <div class="campo">
        <label for="f-categoria">Categoria</label>
        <select id="f-categoria" name="categoria">${opcoesCategoria(doc, v.tipo, v.categoriaId)}</select>
        <span class="erro" data-erro="categoria"></span>
      </div>
      <div class="campo">
        <label for="f-descricao">Descrição</label>
        <input id="f-descricao" name="descricao" maxlength="120" autocomplete="off" value="${esc(v.descricao)}">
        <datalist id="servicos">${SERVICOS_REFERENCIA.map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
        <span class="erro" data-erro="descricao"></span>
      </div>
      <div class="acoes">
        <button type="submit" class="botao botao-primario">Salvar</button>
        ${existente ? `<button type="button" class="botao botao-perigo" data-excluir>Excluir</button>` : ""}
      </div>
    </form>`;

  const form = container.querySelector("form");
  const descricao = form.elements.descricao;
  const tipoAtual = () => form.elements.tipo.value;
  const ajustarSugestoes = () => {
    if (tipoAtual() === "receita") descricao.setAttribute("list", "servicos"); else descricao.removeAttribute("list");
  };
  ajustarSugestoes();

  for (const radio of form.elements.tipo) {
    radio.addEventListener("change", () => {
      form.elements.categoria.innerHTML = opcoesCategoria(store.get(), tipoAtual(), "");
      ajustarSugestoes();
    });
  }
  for (const campo of form.querySelectorAll("input, select")) {
    campo.addEventListener("input", () => {
      const chave = campo.name === "categoria" ? "categoria" : campo.name;
      const span = form.querySelector(`[data-erro="${chave}"]`);
      if (span) span.textContent = "";
      campo.removeAttribute("aria-invalid");
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const r = validarLancamento({
      tipo: tipoAtual(),
      valorTexto: form.elements.valor.value,
      data: form.elements.data.value,
      categoriaId: form.elements.categoria.value,
      descricao: descricao.value,
    }, store.get());
    for (const span of form.querySelectorAll("[data-erro]")) span.textContent = r.ok ? "" : (r.erros[span.dataset.erro] ?? "");
    for (const [chave, nome] of [["valor", "valor"], ["data", "data"], ["categoria", "categoria"], ["descricao", "descricao"]]) {
      form.elements[nome].setAttribute("aria-invalid", String(!r.ok && chave in r.erros));
    }
    if (!r.ok) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    estado.ano = anoDe(r.lancamento.data);
    estado.mes = mesDe(r.lancamento.data);
    location.hash = "#mes";
    if (existente) store.updateLancamento(existente.id, r.lancamento);
    else store.addLancamento({ ...r.lancamento, exemplo: false });
  });

  container.querySelector("[data-excluir]")?.addEventListener("click", () => {
    if (!confirm("Excluir este lançamento?")) return;
    location.hash = "#mes";
    store.removeLancamento(existente.id);
  });
}
