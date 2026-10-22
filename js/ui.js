// Utilidades de interface compartilhadas pelas telas.

export const NOMES_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
// Crédito institucional exibido no app, no relatório e no Excel.
export const CREDITO = "Gestão Empresarial · CEP Escola Técnica de Santa Maria";

export const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Escapa texto digitado pelo aluno antes de inserir no HTML.
export function esc(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Faixa de aviso no topo da tela; some ao tocar ou sozinha (exceto se fixo). Retorna o elemento.
export function mostrarAviso(texto, tipo = "info", { fixo = false } = {}) {
  const area = document.getElementById("avisos");
  const el = document.createElement("button");
  el.type = "button";
  el.className = `aviso aviso-${tipo}`;
  el.textContent = texto;
  el.addEventListener("click", () => el.remove());
  area.appendChild(el);
  if (!fixo) setTimeout(() => el.remove(), tipo === "erro" ? 10000 : 5000);
  return el;
}

export function baixarArquivo(nome, conteudo, mime) {
  const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
