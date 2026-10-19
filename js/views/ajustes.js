// Tela Ajustes: ano, saldo de abertura, dados de exemplo, backup, Excel e apagar dados.
import { saldoAbertura, anosDisponiveis } from "../calc.js";
import { exportarBackup, validarBackup } from "../backup.js";
import { gerarExemplo, removerExemplos } from "../exemplo.js";
import { criarDocumentoInicial } from "../defaults.js";
import { hojeISO, anoDe, parseSaldo, centavosParaTexto, formatMoeda } from "../format.js";
import { mostrarAviso, baixarArquivo } from "../ui.js";
import { exportarExcel } from "../excel.js";

export function render(container, { store, estado, render: rerender }) {
  const doc = store.get();
  const ano = estado.ano;
  const abertura = saldoAbertura(doc, ano);
  const anos = anosDisponiveis(doc, anoDe(hojeISO()));
  if (!anos.includes(ano)) anos.push(ano);
  anos.sort((a, b) => a - b);
  const temExemplos = doc.lancamentos.some((l) => l.exemplo);
  const valorAbertura = abertura.valor === 0 ? "" : (abertura.valor < 0 ? "-" : "") + centavosParaTexto(Math.abs(abertura.valor));

  container.innerHTML = `
    <div class="cabecalho"><span style="width:40px"></span><h1>Ajustes</h1><span style="width:40px"></span></div>
    <div class="form">
      <div class="campo">
        <label for="a-ano">Ano</label>
        <select id="a-ano">${anos.map((a) => `<option value="${a}"${a === ano ? " selected" : ""}>${a}</option>`).join("")}</select>
      </div>
      <div class="campo">
        <label for="a-abertura">Saldo de abertura de ${ano} (caixa/banco em 1º de janeiro)</label>
        ${abertura.herdado
          ? `<input id="a-abertura" value="${formatMoeda(abertura.valor)}" disabled>
             <span class="item-meta">Herdado de dezembro/${ano - 1}</span>`
          : `<div class="linha-campo">
               <input id="a-abertura" inputmode="decimal" placeholder="0,00" value="${valorAbertura}">
               <button type="button" class="botao" data-salvar-abertura>Salvar</button>
             </div>
             <span class="erro" data-erro-abertura></span>`}
      </div>

      <h2>Dados de exemplo</h2>
      <p class="dica">Preenche ${ano} com lançamentos fictícios para você ver o app funcionando. Seus lançamentos não são afetados.</p>
      <div class="acoes">
        <button type="button" class="botao" data-exemplo>Carregar exemplo em ${ano}</button>
        ${temExemplos ? `<button type="button" class="botao" data-remover-exemplos>Remover exemplos</button>` : ""}
      </div>

      <h2>Backup</h2>
      <p class="dica">Seus dados ficam só neste aparelho. Faça backup com frequência e guarde o arquivo no Drive, e-mail ou WhatsApp.</p>
      <div class="acoes">
        <button type="button" class="botao botao-primario" data-backup>Fazer backup</button>
        <label class="botao">Restaurar backup<input type="file" accept=".json,application/json" data-restaurar hidden></label>
        <button type="button" class="botao" data-excel>Exportar ${ano} para Excel</button>
      </div>
      <p class="item-meta">${doc.ultimoBackup ? `Último backup: ${doc.ultimoBackup.split("-").reverse().join("/")}` : "Nenhum backup feito ainda."}</p>

      <h2>Outros</h2>
      <div class="acoes">
        <a class="botao" href="instalar.html">Como instalar o app</a>
        <button type="button" class="botao botao-perigo" data-apagar>Apagar todos os dados</button>
      </div>
    </div>`;

  const $ = (sel) => container.querySelector(sel);

  $("#a-ano").addEventListener("change", (ev) => { estado.ano = Number(ev.target.value); rerender(); });

  $("[data-salvar-abertura]")?.addEventListener("click", () => {
    const centavos = parseSaldo($("#a-abertura").value);
    if (centavos === null) {
      $("[data-erro-abertura]").textContent = "Informe um valor válido, por exemplo 1.500,00 ou -200,00";
      return;
    }
    store.setSaldoAbertura(ano, centavos);
    mostrarAviso("Saldo de abertura salvo");
  });

  $("[data-exemplo]").addEventListener("click", () => {
    const atual = store.get();
    const jaTem = atual.lancamentos.some((l) => l.exemplo && anoDe(l.data) === ano);
    if (jaTem && !confirm(`${ano} já tem dados de exemplo. Substituir pelos novos?`)) return;
    const mantidos = atual.lancamentos.filter((l) => !(l.exemplo && anoDe(l.data) === ano));
    store.replaceAll({ ...atual, lancamentos: [...mantidos, ...gerarExemplo(atual, ano)] });
    mostrarAviso(`Exemplo carregado em ${ano}`);
  });

  $("[data-remover-exemplos]")?.addEventListener("click", () => {
    if (!confirm("Remover todos os lançamentos de exemplo?")) return;
    store.replaceAll(removerExemplos(store.get()));
    mostrarAviso("Exemplos removidos");
  });

  $("[data-backup]").addEventListener("click", () => {
    const hoje = hojeISO();
    const { nomeArquivo, conteudo } = exportarBackup(store.get(), hoje);
    baixarArquivo(nomeArquivo, conteudo, "application/json");
    store.marcarBackup(hoje);
  });

  $("[data-restaurar]").addEventListener("change", async (ev) => {
    const arquivo = ev.target.files[0];
    ev.target.value = "";
    if (!arquivo) return;
    const r = validarBackup(await arquivo.text());
    if (!r.ok) {
      mostrarAviso(r.erro, "erro");
      return;
    }
    const anosTexto = r.resumo.anos.length ? `, anos ${r.resumo.anos.join(", ")}` : "";
    if (!confirm(`${r.resumo.lancamentos} lançamentos${anosTexto}. Substituir os dados atuais?`)) return;
    store.replaceAll(r.doc);
    mostrarAviso("Backup restaurado");
  });

  $("[data-excel]").addEventListener("click", () => {
    if (typeof XLSX === "undefined") {
      mostrarAviso("Exportação para Excel indisponível.", "erro");
      return;
    }
    exportarExcel(store.get(), ano);
  });

  $("[data-apagar]").addEventListener("click", () => {
    if (!confirm("Apagar TODOS os lançamentos e categorias deste aparelho?")) return;
    if (!confirm("Tem certeza? Isso não pode ser desfeito. Faça um backup antes, se precisar.")) return;
    store.replaceAll(criarDocumentoInicial());
    mostrarAviso("Dados apagados");
  });
}
