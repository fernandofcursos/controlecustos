// Service worker: guarda o app no aparelho para funcionar offline.
// Ao publicar uma nova versão, aumente VERSAO (cc-v2, cc-v3…) para os alunos receberem o aviso de atualização.
const VERSAO = "cc-v2";

const ARQUIVOS = [
  "./",
  "index.html",
  "instalar.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/app.js",
  "js/backup.js",
  "js/calc.js",
  "js/defaults.js",
  "js/excel.js",
  "js/exemplo.js",
  "js/format.js",
  "js/relatorio.js",
  "js/store.js",
  "js/ui.js",
  "js/validacao.js",
  "js/views/ajustes.js",
  "js/views/categorias.js",
  "js/views/lancamento.js",
  "js/views/mes.js",
  "js/views/relatorio.js",
  "js/views/resumo.js",
  "vendor/chart.umd.min.js",
  "vendor/xlsx.full.min.js",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
];

self.addEventListener("install", (ev) => {
  // cache: "reload" ignora o cache HTTP do navegador, para não guardar arquivos antigos na versão nova.
  ev.waitUntil(caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS.map((url) => new Request(url, { cache: "reload" })))));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (ev) => {
  if (ev.data === "pular-espera") self.skipWaiting();
});

self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then((resposta) => {
      if (resposta) return resposta;
      return fetch(ev.request).catch(() => {
        if (ev.request.mode === "navigate") return caches.match("index.html");
        throw new Error("offline");
      });
    }),
  );
});
