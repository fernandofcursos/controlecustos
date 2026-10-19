// Inicialização e roteamento por hash (#mes, #resumo, #categorias, #ajustes, #lancamento[/id]).
import { createStore } from "./store.js";
import { hojeISO, anoDe, mesDe } from "./format.js";
import { mostrarAviso } from "./ui.js";
import * as mes from "./views/mes.js";
import * as lancamento from "./views/lancamento.js";
import * as resumo from "./views/resumo.js";
import * as categorias from "./views/categorias.js";
import * as ajustes from "./views/ajustes.js";
import { precisaAvisoBackup } from "./backup.js";

const VIEWS = { mes, lancamento, resumo, categorias, ajustes };

const store = createStore();
const hoje = hojeISO();
const estado = { ano: anoDe(hoje), mes: mesDe(hoje), filtro: "todos" };
const tela = document.getElementById("tela");
const fab = document.querySelector(".fab");

function rotaAtual() {
  const [nome, id] = location.hash.replace(/^#/, "").split("/");
  return { nome: VIEWS[nome] ? nome : "mes", id: id ? decodeURIComponent(id) : null };
}

function render() {
  const rota = rotaAtual();
  for (const a of document.querySelectorAll(".nav a")) {
    a.classList.toggle("ativo", a.dataset.rota === rota.nome);
    if (a.dataset.rota === rota.nome) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  }
  fab.classList.toggle("oculto", rota.nome === "lancamento");
  VIEWS[rota.nome].render(tela, { store, estado, rota, render });
}

let avisouFalha = false;
store.subscribe((_doc, salvou) => {
  if (!salvou && !avisouFalha) {
    avisouFalha = true;
    mostrarAviso("Não foi possível salvar neste navegador. Faça um backup.", "erro", { fixo: true });
  }
  render();
});

window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();

if (precisaAvisoBackup(store.get(), hoje)) {
  mostrarAviso("Faça um backup dos seus dados (Ajustes → Fazer backup).", "info");
}

// Modo offline e aviso de nova versão.
if ("serviceWorker" in navigator) {
  const oferecerAtualizacao = (worker) => {
    const aviso = mostrarAviso("Nova versão disponível — Atualizar", "info", { fixo: true });
    aviso.addEventListener("click", () => worker.postMessage("pular-espera"));
  };
  navigator.serviceWorker.register("sw.js").then((reg) => {
    if (reg.waiting && navigator.serviceWorker.controller) oferecerAtualizacao(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const novo = reg.installing;
      novo?.addEventListener("statechange", () => {
        if (novo.state === "installed" && navigator.serviceWorker.controller) oferecerAtualizacao(novo);
      });
    });
  }).catch(() => {});
  // Recarrega só quando uma versão nova assume (não na primeira instalação).
  const jaTinhaVersao = !!navigator.serviceWorker.controller;
  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregando || !jaTinhaVersao) return;
    recarregando = true;
    location.reload();
  });
}

// Pede ao navegador para não apagar os dados do app por falta de espaço.
navigator.storage?.persist?.().catch(() => {});
