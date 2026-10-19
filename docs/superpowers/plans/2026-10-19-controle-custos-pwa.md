# Controle de Custos PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a planilha "CONTROLE DE CUSTOS - CEP ETSM" num app web instalável (PWA), offline, com os dados só no aparelho do aluno.

**Architecture:** O app usa HTML, CSS e JS puro com módulos ES, sem build. A lógica pura fica em `format.js`, `calc.js`, `validacao.js`, `backup.js` e `exemplo.js`, todos sem DOM e todos testados. O `store.js` é a única porta de acesso ao `localStorage`. As views só leem e gravam pelo store e só exibem números vindos do `calc.js`. Um service worker com cache versionado garante o uso offline.

**Tech Stack:** HTML5, CSS, JavaScript ES2020 (módulos), Chart.js 4.4.1 e SheetJS 0.18.5, ambos copiados para `vendor/`, e GitHub Pages. Para desenvolver: `python3 -m http.server 8000`, porque módulos ES não carregam via `file://`.

**Spec:** `docs/superpowers/specs/2026-10-19-controle-custos-pwa-design.md`

## Global Constraints

- Sem framework, sem Node e sem etapa de build. O projeto todo roda servido como arquivos estáticos.
- Todos os valores monetários são **inteiros em centavos**, e só o `format.js` converte para texto.
- Moeda no formato pt-BR, `R$ 1.234,56`. Datas armazenadas como `aaaa-mm-dd` e exibidas como `dd/mm/aaaa`.
- Chave do `localStorage`: `controleCustos.v1`. Versão do documento: `versao: 1`.
- Nenhuma requisição de rede em tempo de execução além dos próprios arquivos do app. As bibliotecas vêm de `vendor/`.
- Os textos da interface ficam em português, com as mensagens exatas do spec: "Arquivo inválido ou corrompido" e "Nova versão disponível — Atualizar".
- O layout desktop começa em ≥ 900 px. Nas telas menores vale o layout mobile-first.
- Rodapé de créditos: "Centro de Educação Profissional de Santa Maria — Curso de Administração".

## Review Focus

1. **Fuso horário em datas.** `new Date("2026-03-01")` é interpretado em UTC e, no Brasil, vira 28/02. O mês e o ano devem sair da string, e "hoje" deve usar a data local. O teste fica na Task 1.
2. **Valores digitados de jeitos variados.** As entradas "R$ 50", " 1.234,56 ", "-50", "0,004" e "abc" são aceitas e normalizadas, ou rejeitadas, sem gerar NaN. O teste fica na Task 1.
3. **`localStorage` indisponível ou cheio** (aba anônima do Safari, cota estourada). O app não pode quebrar: `save()` retorna `false` e a tela mostra um aviso. O teste fica na Task 2.
4. **Backup de outra versão ou malformado.** Um backup com `versao: 2`, um JSON truncado ou um lançamento apontando para categoria inexistente deve ser rejeitado sem alterar os dados. O teste fica na Task 4.
5. **Anos não consecutivos.** Se há dados em 2026 e 2028, mas nenhum em 2027, o saldo de abertura de 2028 é o manual: a herança só vale entre anos consecutivos. O teste fica na Task 3.

---

## File structure

As responsabilidades de cada arquivo estão na seção 2 do spec. Este plano acrescenta:
- `js/validacao.js`, para validar o formulário de lançamento como função pura testável;
- `tests/runner.js`, um mini-executor de testes;
- `README.md`, com o guia de publicação para o professor.

---

### Task 1: Esqueleto, executor de testes e `format.js`

**Files:**
- Create: `testes.html`, `tests/runner.js`, `tests/format.test.js`, `js/format.js`, `.gitignore`

**Interfaces:**
- Produces (`tests/runner.js`): `test(nome: string, fn: () => void)`, `assertEqual(atual, esperado, msg?)`, `assertDeepEqual(atual, esperado, msg?)`, `assertThrows(fn, msg?)` e `run(): {passou: number, falhou: number}`. O `testes.html` importa todos os `tests/*.test.js` (lista explícita de `<script type="module">`), chama `run()` e escreve em `#resultado` o texto `"<n> passaram, <m> falharam"`, com a lista de falhas logo abaixo.
- Produces (`js/format.js`):
  - `parseReais(texto: string) -> number | null`: devolve centavos ou `null` quando o texto é inválido;
  - `formatMoeda(centavos: number) -> string`;
  - `formatData(iso: string) -> string`;
  - `hojeISO(agora?: Date) -> string`;
  - `anoDe(iso: string) -> number`;
  - `mesDe(iso: string) -> number`.

- [ ] **Step 1: Iniciar o repositório**

Run: `git init && printf ".superpowers/\n.DS_Store\n" > .gitignore`
Expected: `Initialized empty Git repository`

- [ ] **Step 2: Escrever o runner e os testes que devem falhar**

`tests/format.test.js`:
```js
test("parseReais aceita formatos pt-BR", () => {
  assertEqual(parseReais("1.234,56"), 123456);
  assertEqual(parseReais("1234,56"), 123456);
  assertEqual(parseReais("1234.56"), 123456);
  assertEqual(parseReais("R$ 50"), 5000);
  assertEqual(parseReais(" 180,00 "), 18000);
  assertEqual(parseReais("0,005"), 1);      // arredonda meio centavo para cima
});
test("parseReais rejeita inválidos", () => {
  for (const t of ["", "abc", "-50", "0", "0,004", "1,2,3"]) assertEqual(parseReais(t), null, t);
});
test("formatMoeda", () => {
  assertEqual(formatMoeda(123456), "R$ 1.234,56");
  assertEqual(formatMoeda(-18000), "-R$ 180,00");
  assertEqual(formatMoeda(0), "R$ 0,00");
});
test("datas sem fuso", () => {
  assertEqual(mesDe("2026-03-01"), 3);
  assertEqual(anoDe("2027-01-05"), 2027);
  assertEqual(formatData("2026-03-01"), "01/03/2026");
  assertEqual(hojeISO(new Date(2026, 2, 1, 23, 30)), "2026-03-01");
});
```

- [ ] **Step 3: Rodar e conferir a falha**

Run: `python3 -m http.server 8000` (em segundo plano). Depois abra `http://localhost:8000/testes.html` no navegador.
Expected: erro de import ou `0 passaram, 4 falharam`.

- [ ] **Step 4: Implementar o `js/format.js`**

- `parseReais`: remove `R$` e espaços. Rejeita sinal `-`. Se houver vírgula, os pontos são separadores de milhar e a vírgula é o decimal. Sem vírgula, o ponto é o decimal, exceto no padrão `^\d{1,3}(\.\d{3})+$` ("1.500", "10.000"), em que os pontos são separadores de milhar (correção da revisão final). Exige o padrão `^\d+(\.\d{1,})?$` depois de normalizar, aplica `Math.round(valor * 100)` e devolve `null` se o resultado for ≤ 0.
- `formatMoeda`: usa `Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"})` e troca o espaço não separável por um espaço normal, para que a saída seja exatamente `"R$ 1.234,56"`. O sinal negativo vai antes, `"-R$ 180,00"`.
- `anoDe` e `mesDe`: saem só da string (`split("-")`), sem `Date`.

- [ ] **Step 5: Rodar e conferir que passa**

Expected: `4 passaram, 0 falharam`

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: executor de testes no navegador e format.js"
```

---

### Task 2: `defaults.js` e `store.js`

**Files:**
- Create: `js/defaults.js`, `js/store.js`, `tests/store.test.js`

**Interfaces:**
- Consumes: nada.
- Produces (`js/defaults.js`):
  - `CATEGORIAS_PADRAO: Categoria[]`, com as 26 de custo e as 10 de receita na ordem da aba Categorias da planilha (listas na seção 3 do spec e na planilha, colunas A e F). Os ids são slugs, como `c_aluguel` e `r_servicos_prestados`, todos com `natureza: null` e `ativa: true`;
  - `SERVICOS_REFERENCIA: string[]`, com os 12 itens da coluna H;
  - `criarDocumentoInicial() -> Documento`, que monta `{versao:1, categorias:[...cópia], anos:{}, lancamentos:[], ultimoBackup:null}`.
- Produces (`js/store.js`): `createStore(storage = window.localStorage) -> Store`, onde `Store` tem:
  - `get() -> Documento`;
  - `save() -> boolean`;
  - `subscribe(fn: (doc) => void) -> () => void`;
  - `addLancamento(dados) -> Lancamento`, que cria o `id`;
  - `updateLancamento(id, patch) -> void`;
  - `removeLancamento(id) -> void`;
  - `addCategoria({nome, tipo, natureza}) -> Categoria`;
  - `updateCategoria(id, patch) -> void`;
  - `removeCategoria(id) -> void`, que lança `Error("Categoria em uso")` se houver lançamento com ela;
  - `setSaldoAbertura(ano: number, centavos: number) -> void`;
  - `replaceAll(doc) -> void`;
  - `marcarBackup(isoData) -> void`.

  Também exporta `novoId(prefixo: string) -> string`, que gera `prefixo + "_" + Date.now().toString(36) + aleatório`.

- [ ] **Step 1: Escrever os testes que devem falhar** (com um `storage` falso, um objeto com `getItem` e `setItem`)

```js
test("documento inicial tem 26 custos e 10 receitas", () => {
  const d = criarDocumentoInicial();
  assertEqual(d.categorias.filter(c => c.tipo === "custo").length, 26);
  assertEqual(d.categorias.filter(c => c.tipo === "receita").length, 10);
  assertEqual(SERVICOS_REFERENCIA.length, 12);
});
test("salva e recarrega", () => {
  const mem = fakeStorage(); const s = createStore(mem);
  s.addLancamento({tipo:"custo", data:"2026-03-12", categoriaId:"c_aluguel", descricao:"", valor:90000, exemplo:false});
  assertEqual(createStore(mem).get().lancamentos.length, 1);
});
test("removeCategoria em uso lança erro; sem uso remove", () => { /* addLancamento com c_aluguel; assertThrows(() => s.removeCategoria("c_aluguel")); s.removeCategoria("c_seguros") reduz custos para 25 */ });
test("storage que lança erro: save retorna false e get continua funcionando", () => {
  const ruim = { getItem: () => { throw new Error("SecurityError"); }, setItem: () => { throw new Error("QuotaExceeded"); } };
  const s = createStore(ruim);
  assertEqual(s.get().versao, 1);
  assertEqual(s.save(), false);
});
test("subscribe é chamado após mutação", () => { /* contador incrementa em addLancamento */ });
```

- [ ] **Step 2: Rodar e conferir a falha.** Adicione `tests/store.test.js` ao `testes.html`. Expected: os testes do store falham.
- [ ] **Step 3: Implementar `defaults.js` e `store.js`.** Toda mutação chama `save()` e depois avisa os assinantes. Se o JSON lido estiver corrompido, usa `criarDocumentoInicial()`.
- [ ] **Step 4: Rodar e conferir que passa.** Expected: `0 falharam`.
- [ ] **Step 5: Commit** — `git commit -am "feat: store e categorias padrão"` (antes, `git add js tests`).

---

### Task 3: `calc.js`

**Files:**
- Create: `js/calc.js`, `tests/calc.test.js`

**Interfaces:**
- Consumes: `anoDe` e `mesDe` (Task 1), além do formato `Documento`.
- Produces:
  - `saldoAbertura(doc, ano) -> {valor: number, herdado: boolean}`;
  - `resumoMes(doc, ano, mes) -> {saldoAnterior, receitas, despesas, saldoFinal}`;
  - `resumoAno(doc, ano) -> {totalReceitas, totalDespesas, lucro, margem, saldoAcumulado, meses: Array<12 × {mes, receitas, despesas, lucro, saldoFinal}>}`;
  - `porCategoria(doc, ano, tipo) -> Array<{categoriaId, nome, total, pct}>`, só itens com `total > 0`, em ordem decrescente de total;
  - `lancamentosDoMes(doc, ano, mes, filtro: "todos"|"receita"|"custo") -> Lancamento[]`, em ordem crescente de data;
  - `anosDisponiveis(doc, anoAtual) -> number[]`, crescente e sem repetição, incluindo `anoAtual`.

  A margem é um número entre 0 e 1 (ou negativo), e não uma porcentagem.

- [ ] **Step 1: Escrever os testes que devem falhar.** Use um helper `doc(lancs, anos)` sobre `criarDocumentoInicial()`.

```js
test("saldo transporta entre meses", () => {
  const d = doc([L("receita","2026-01-10",100000), L("custo","2026-01-20",30000), L("custo","2026-02-05",20000)], {2026:{saldoAbertura:50000}});
  assertDeepEqual(resumoMes(d,2026,1), {saldoAnterior:50000, receitas:100000, despesas:30000, saldoFinal:120000});
  assertEqual(resumoMes(d,2026,2).saldoAnterior, 120000);
  assertEqual(resumoMes(d,2026,12).saldoFinal, 100000);
});
test("abertura herdada do ano anterior consecutivo", () => {
  const d = doc([L("receita","2026-06-01",10000)], {2026:{saldoAbertura:5000}, 2027:{saldoAbertura:999}});
  assertDeepEqual(saldoAbertura(d,2027), {valor:15000, herdado:true});
});
test("anos não consecutivos não herdam", () => {
  const d = doc([L("receita","2026-06-01",10000), L("receita","2028-01-01",100)], {2028:{saldoAbertura:700}});
  assertDeepEqual(saldoAbertura(d,2028), {valor:700, herdado:false});
});
test("margem com receita zero é 0", () => {
  assertEqual(resumoAno(doc([L("custo","2026-03-01",500)]),2026).margem, 0);
});
test("porCategoria: pct, ordem e zero", () => { /* dois custos 3000 aluguel + 1000 energia → [{c_aluguel,pct:0.75},{c_energia,pct:0.25}]; ano sem dados → [] */ });
test("categoria desativada continua no resumo", () => { /* ativa:false em c_aluguel, total aparece */ });
test("lançamento movido para 2027 sai de 2026", () => { /* muda data do lançamento; resumoAno(2026).totalReceitas === 0 */ });
test("anosDisponiveis", () => { assertDeepEqual(anosDisponiveis(doc([L("custo","2025-05-01",1)]), 2026), [2025, 2026]); });
```

- [ ] **Step 2: Rodar e conferir a falha.** Adicione o arquivo ao `testes.html`.
- [ ] **Step 3: Implementar.** Regra de `saldoAbertura(A)`: se `A−1` tiver lançamentos ou `anos[A−1]` existir, o resultado é `{valor: resumoMes(doc, A−1, 12).saldoFinal, herdado: true}`, calculado recursivamente. Caso contrário, `{valor: anos[A]?.saldoAbertura ?? 0, herdado: false}`.
- [ ] **Step 4: Rodar e conferir que passa.**
- [ ] **Step 5: Commit** — `git add js/calc.js tests && git commit -m "feat: cálculos do mês e do ano"`

---

### Task 4: `validacao.js` e `backup.js`

**Files:**
- Create: `js/validacao.js`, `js/backup.js`, `tests/validacao.test.js`, `tests/backup.test.js`

**Interfaces:**
- Consumes: `parseReais` (Task 1), `Documento` e `Categoria`.
- Produces:
  - `validarLancamento(entrada: {tipo, valorTexto, data, categoriaId, descricao}, doc) -> {ok: true, lancamento: {tipo, data, categoriaId, descricao, valor}} | {ok: false, erros: {[campo]: string}}`. As mensagens são exatamente estas:
    - valor: `"Informe um valor maior que zero"`;
    - data: `"Informe uma data válida"`;
    - categoria: `"Escolha uma categoria"`;
    - descricao: `"Máximo de 100 caracteres"`.
  - `exportarBackup(doc, hojeIso) -> {nomeArquivo: "controle-custos-backup-<hojeIso>.json", conteudo: string}`;
  - `validarBackup(texto: string) -> {ok: true, doc, resumo: {lancamentos: number, anos: number[]}} | {ok: false, erro: "Arquivo inválido ou corrompido"}`;
  - `precisaAvisoBackup(doc, hojeIso) -> boolean`: verdadeiro quando há lançamentos e o último backup é nulo ou tem mais de 30 dias.

- [ ] **Step 1: Escrever os testes que devem falhar**

```js
test("validarLancamento ok converte valor", () => { /* valorTexto "180,00" → lancamento.valor 18000 */ });
test("validarLancamento erros", () => {
  const r = validarLancamento({tipo:"custo", valorTexto:"0", data:"2026-02-30", categoriaId:"r_servicos_prestados", descricao:"x".repeat(101)}, d);
  assertDeepEqual(Object.keys(r.erros).sort(), ["categoria","data","descricao","valor"]);   // categoria de receita num custo é inválida
});
test("backup ida e volta é idêntico", () => {
  const {conteudo} = exportarBackup(d, "2026-10-19");
  assertDeepEqual(validarBackup(conteudo).doc, d);
});
test("backup inválido rejeitado", () => {
  for (const t of ["{", "[]", JSON.stringify({...d, versao:2}), JSON.stringify({...d, lancamentos:[{...lanc, categoriaId:"nao_existe"}]})])
    assertDeepEqual(validarBackup(t), {ok:false, erro:"Arquivo inválido ou corrompido"});
});
test("aviso de backup após 30 dias", () => { /* sem lançamentos → false; ultimoBackup null → true; "2026-09-18" com hoje "2026-10-19" → true; "2026-09-20" → false */ });
```

- [ ] **Step 2: Rodar e conferir a falha.**
- [ ] **Step 3: Implementar.** A data é válida quando bate com `^\d{4}-\d{2}-\d{2}$` e quando o dia existe naquele mês (calcular com `new Date(a, m, 0).getDate()`). `validarBackup` confere `versao === 1`, que os arrays existem, que cada lançamento tem campos do tipo certo e `valor` inteiro > 0, e que `categoriaId` existe e tem o mesmo `tipo`.
- [ ] **Step 4: Rodar e conferir que passa.**
- [ ] **Step 5: Commit** — `git add js tests && git commit -m "feat: validação de lançamento e backup"`

---

### Task 5: `exemplo.js`

**Files:**
- Create: `js/exemplo.js`, `tests/exemplo.test.js`

**Interfaces:**
- Consumes: `SERVICOS_REFERENCIA` e `CATEGORIAS_PADRAO` (Task 2).
- Produces:
  - `gerarExemplo(doc, ano, semente = 2026) -> Lancamento[]`: lançamentos com `exemplo: true` e ids próprios, sem alterar o `doc`;
  - `removerExemplos(doc) -> Documento`: um novo documento sem os lançamentos com `exemplo: true`.

- [ ] **Step 1: Escrever os testes que devem falhar**

```js
test("exemplo: quantidades por mês e marcação", () => {
  const ls = gerarExemplo(criarDocumentoInicial(), 2026);
  for (let m = 1; m <= 12; m++) {
    const r = ls.filter(l => mesDe(l.data) === m && l.tipo === "receita").length;
    const c = ls.filter(l => mesDe(l.data) === m && l.tipo === "custo").length;
    assert(r >= 4 && r <= 6 && c >= 6 && c <= 10, `mês ${m}`);
  }
  assert(ls.every(l => l.exemplo === true && anoDe(l.data) === 2026));
  assert(["c_aluguel","c_internet_e_telefone","c_honorarios_contador"].every(id => ls.filter(l => l.categoriaId === id).length === 12));
});
test("exemplo é reprodutível com a mesma semente", () => { /* valores e datas iguais em duas chamadas (ignorando id) */ });
test("removerExemplos preserva os dados do aluno", () => { /* 1 lançamento do aluno + exemplos → resta 1 */ });
```
(Acrescente `assert(cond, msg?)` ao `runner.js`.)

- [ ] **Step 2: Rodar e conferir a falha.**
- [ ] **Step 3: Implementar.** Usa um PRNG `mulberry32(semente)`. Os custos fixos ficam no dia 5 com valores constantes. Os variáveis e as receitas recebem dia, categoria e valor do PRNG, com faixas de R$ 50 a R$ 600 para custos e de R$ 150 a R$ 1.200 para receitas. As descrições das receitas vêm de `SERVICOS_REFERENCIA`.
- [ ] **Step 4: Rodar e conferir que passa.**
- [ ] **Step 5: Commit** — `git add js tests && git commit -m "feat: gerador de dados de exemplo"`

---

### Task 6: Casca do app, tela Mês e tela Lançamento

**Files:**
- Create: `index.html`, `css/app.css`, `js/app.js`, `js/views/mes.js`, `js/views/lancamento.js`

**Interfaces:**
- Consumes: `createStore` (Task 2), `resumoMes` e `lancamentosDoMes` (Task 3), `validarLancamento` (Task 4), `formatMoeda`, `formatData` e `hojeISO` (Task 1), `SERVICOS_REFERENCIA`.
- Produces:
  - cada view exporta `render(container: HTMLElement, ctx: {store, estado}) -> void`;
  - `estado` é `{ano: number, mes: number, filtro: "todos"|"receita"|"custo"}`, guardado em `app.js`;
  - rotas por hash: `#mes`, `#resumo`, `#categorias`, `#ajustes`, `#lancamento` (novo) e `#lancamento/<id>` (edição);
  - `app.js` exporta `mostrarAviso(texto: string, tipo: "info"|"erro")`, que mostra uma faixa no topo e fecha com um toque.

- [ ] **Step 1: Montar a casca.** O `index.html` tem a `<nav>` com as 4 abas e ícones, o `<main id="tela">`, o botão flutuante `+` (`href="#lancamento"`) e o rodapé de créditos. O `css/app.css` é mobile-first, com a barra inferior fixa; a partir de `@media (min-width: 900px)` a nav vira lateral e `.mes-colunas` usa duas colunas. O `app.js` faz o roteamento no `hashchange`, assina o store para re-renderizar e chama `mostrarAviso("Não foi possível salvar neste navegador. Faça um backup.", "erro")` quando `save()` retorna `false`.
- [ ] **Step 2: Implementar `views/mes.js`**, seguindo o esboço aprovado na Parte 2. As setas mudam `estado.mes` e `estado.ano`: de dezembro para a frente vira janeiro do ano seguinte. O painel tem 4 cartões, e o saldo final usa a classe `.positivo` ou `.negativo`. A lista respeita o filtro e cada item leva a `#lancamento/<id>`.
- [ ] **Step 3: Implementar `views/lancamento.js`.**
  - O seletor Receita/Custo filtra as categorias para mostrar só as ativas do tipo.
  - O campo Valor é `inputmode="decimal"`.
  - A data padrão é `hojeISO()` quando `estado` está no mês atual e o dia 1 do mês exibido nos outros casos.
  - A descrição usa um `<datalist>` com `SERVICOS_REFERENCIA` quando o tipo é receita.
  - Ao salvar: com `validarLancamento` ok, chama `addLancamento` ou `updateLancamento` e volta para `#mes`; com erro, mostra a mensagem abaixo de cada campo.
  - Excluir passa por `confirm("Excluir este lançamento?")`.
- [ ] **Step 4: Verificar no navegador.** Abra `http://localhost:8000/`, crie uma receita de "1.000,00" e um custo de "300" em março/2026 e confira no painel: Receitas `R$ 1.000,00`, Despesas `R$ 300,00`, Saldo final `R$ 700,00`. Edite a data do custo para abril e confira que o saldo anterior de abril é `R$ 1.000,00`. Recarregue a página e confira que os dados continuam lá. Teste com largura de 375 px e de 1280 px.
- [ ] **Step 5: Rodar `testes.html`.** Expected: `0 falharam`.
- [ ] **Step 6: Commit** — `git add . && git commit -m "feat: casca do app, telas Mês e Lançamento"`

---

### Task 7: Tela Resumo

**Files:**
- Create: `js/views/resumo.js`, `vendor/chart.umd.min.js`
- Modify: `index.html` (incluir `<script src="vendor/chart.umd.min.js">`)

**Interfaces:**
- Consumes: `resumoAno` e `porCategoria` (Task 3), `formatMoeda`, e a global `Chart`.

- [ ] **Step 1: Baixar o Chart.js 4.4.1.** Run: `curl -fsSL https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js -o vendor/chart.umd.min.js && head -c 80 vendor/chart.umd.min.js`. Expected: começa com `/*!` e menciona Chart.js v4.4.1.
- [ ] **Step 2: Implementar `render`.**
  - Cartões: Lucro do ano, Margem (`(margem*100).toFixed(0)+"%"`), Receitas, Despesas e Saldo acumulado.
  - Gráfico de barras agrupadas por mês (Jan–Dez) com receitas e despesas. Antes de recriar o gráfico, destrua a instância anterior.
  - Listas de custos e receitas por categoria, com barra proporcional ao `pct`.
  - Tabela com 12 linhas (Mês, Receitas, Despesas, Lucro, Saldo acumulado) e uma linha de Total.
- [ ] **Step 3: Verificar no navegador.** Com os dados da Task 6, o Resumo de 2026 deve mostrar Lucro `R$ 700,00` e Margem `70%`, e a tabela deve mostrar o saldo de março em `R$ 1.000,00` e o de abril em diante em `R$ 700,00`.
- [ ] **Step 4: Commit** — `git add . && git commit -m "feat: tela Resumo com gráfico"`

---

### Task 8: Telas Categorias e Ajustes

**Files:**
- Create: `js/views/categorias.js`, `js/views/ajustes.js`

**Interfaces:**
- Consumes:
  - do store: `addCategoria`, `updateCategoria`, `removeCategoria`, `setSaldoAbertura`, `replaceAll` e `marcarBackup`;
  - `saldoAbertura` e `anosDisponiveis` (Task 3);
  - `exportarBackup`, `validarBackup` e `precisaAvisoBackup` (Task 4);
  - `gerarExemplo` e `removerExemplos` (Task 5);
  - `parseReais`.
- Produces: `baixarArquivo(nome: string, conteudo: string|Blob, mime: string)` em `js/app.js`, que gera o download com `URL.createObjectURL` e um `<a download>`.

- [ ] **Step 1: Implementar `categorias.js`.**
  - Alternância Receitas/Custos.
  - Criar categoria com `prompt("Nome da categoria")`, que rejeita nome vazio ou já existente no mesmo tipo e avisa com `mostrarAviso`.
  - Renomear, um `<select>` Fixo/Variável/—, e ativar/desativar. Categorias desativadas ficam esmaecidas.
  - Botão Excluir visível só para categorias sem lançamentos.
- [ ] **Step 2: Implementar `ajustes.js`.**
  - Seletor de ano com `anosDisponiveis`, que atualiza `estado.ano`.
  - Saldo de abertura: com `herdado`, o campo fica desabilitado com a legenda "Herdado de dezembro/<ano−1>"; sem herança, é editável e salvo com `parseReais`.
  - Carregar exemplo: se já houver exemplos, pede `confirm` e substitui. Remover exemplos.
  - Fazer backup: chama `baixarArquivo` e depois `marcarBackup(hojeISO())`.
  - Restaurar backup: um `<input type=file accept=".json">`. Se `validarBackup` falhar, mostra `mostrarAviso(erro,"erro")`; se der certo, pede `confirm("<n> lançamentos, anos <lista>. Substituir os dados atuais?")` e chama `replaceAll`.
  - Exportar para Excel: o botão fica ligado na Task 9.
  - Apagar todos os dados: dois `confirm` e depois `replaceAll(criarDocumentoInicial())`.
  - Link para `instalar.html` e os créditos.
- [ ] **Step 3: Aviso de backup.** Em `app.js`, ao iniciar, se `precisaAvisoBackup`, mostra `mostrarAviso("Faça um backup dos seus dados (Ajustes → Fazer backup).","info")`.
- [ ] **Step 4: Verificar no navegador.**
  - Renomeie "Aluguel" para "Aluguel da sala" e confira que o Mês e o Resumo mostram o novo nome.
  - Desative uma categoria com uso e confira que ela some do formulário mas continua no Resumo.
  - Carregue o exemplo, remova os exemplos e confira que os 2 lançamentos da Task 6 continuam lá.
  - Faça um backup, apague tudo, restaure e confira que os dados voltaram.
  - Tente restaurar um `.json` qualquer e confira que aparece "Arquivo inválido ou corrompido".
- [ ] **Step 5: Rodar `testes.html`.** Expected: `0 falharam`.
- [ ] **Step 6: Commit** — `git add . && git commit -m "feat: telas Categorias e Ajustes com backup"`

---

### Task 9: Exportar para Excel

**Files:**
- Create: `js/excel.js`, `vendor/xlsx.full.min.js`, `tests/excel.test.js`
- Modify: `index.html` (script do SheetJS), `js/views/ajustes.js` (ligar o botão), `testes.html` (script do SheetJS e o teste)

**Interfaces:**
- Consumes: `resumoAno`, `resumoMes`, `porCategoria` e `lancamentosDoMes` (Task 3), a global `XLSX` e `baixarArquivo` (Task 8).
- Produces:
  - `montarPlanilha(doc, ano) -> XLSX.WorkBook`, com as abas na ordem `["Resumo","Categorias","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]`;
  - `exportarExcel(doc, ano) -> void`, que gera `controle-custos-<ano>.xlsx`.

- [ ] **Step 1: Baixar o SheetJS 0.18.5.** Run: `curl -fsSL https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js -o vendor/xlsx.full.min.js && ls -l vendor/xlsx.full.min.js`. Expected: arquivo com cerca de 900 KB.
- [ ] **Step 2: Escrever o teste que deve falhar**

```js
test("planilha tem 14 abas e valores em reais", () => {
  const wb = montarPlanilha(dComMarco, 2026);   // receita 100000 e custo 30000 em março
  assertDeepEqual(wb.SheetNames, ["Resumo","Categorias","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]);
  const mar = XLSX.utils.sheet_to_json(wb.Sheets["Mar"], {header:1});
  assert(mar.some(l => l.includes("Saldo final do mês")));
  assert(mar.flat().includes(700));             // saldo final em reais (número, não centavos)
});
```
- [ ] **Step 3: Rodar e conferir a falha.**
- [ ] **Step 4: Implementar com `XLSX.utils.aoa_to_sheet`.**
  - Os títulos são os da planilha original: "CONTROLE MENSAL DE RECEITAS E DESPESAS — <MÊS>/<ANO>", "Saldo do mês anterior", "Receitas do mês", "Despesas do mês", "Saldo final do mês", e os blocos "RECEITAS" e "CUSTOS" com as colunas Data, Categoria, Descrição e Valor (R$).
  - Os valores saem em reais (`centavos/100`) com o formato `'#,##0.00'`.
  - O download usa `XLSX.writeFile(wb, nome)`.
- [ ] **Step 5: Rodar e conferir que passa.** Depois, no app, clique em Exportar para Excel e abra o arquivo no Excel: as 14 abas devem estar lá.
- [ ] **Step 6: Commit** — `git add . && git commit -m "feat: exportar para Excel"`

---

### Task 10: PWA — manifest, service worker, ícones e instalação

**Files:**
- Create: `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`, `instalar.html`
- Modify: `index.html` (link do manifest, `theme-color`, `apple-touch-icon`), `js/app.js` (registro do SW e aviso de atualização, `navigator.storage.persist()`)

**Interfaces:**
- Consumes: `mostrarAviso` (Task 6).
- Produces: `sw.js` com `const VERSAO = "cc-v1"` e uma lista `ARQUIVOS` com todos os arquivos estáticos do app, incluindo `vendor/` e `icons/`.

- [ ] **Step 1: Ícones.** Gere PNGs simples (uma letra "C" ou um cifrão sobre a cor do tema) com o Python padrão, escrevendo PNG via `zlib` e `struct`, sem Pillow. Script em `$SCRATCHPAD/gerar_icones.py`; a saída vai para `icons/`.
- [ ] **Step 2: `manifest.webmanifest`.** Valores: `name` "Controle de Custos", `short_name` "Custos", `start_url` "./index.html#mes", `scope` "./", `display` "standalone", `lang` "pt-BR", mais `theme_color`, `background_color` e os 3 ícones (`purpose: "maskable"` no terceiro). Use caminhos relativos para funcionar em `usuario.github.io/controle-custos/`.
- [ ] **Step 3: `sw.js`.**
  - `install`: abre o cache `VERSAO` e faz `addAll(ARQUIVOS)`.
  - `activate`: apaga os caches com nome diferente de `VERSAO`.
  - `fetch`: cache primeiro, rede como alternativa.
  - Escuta a mensagem `"pular-espera"` e chama `skipWaiting()`.
- [ ] **Step 4: Registro em `app.js`.** Quando houver `registration.waiting` (ou `updatefound` com o novo worker em `installed` e um controller existente), mostra uma faixa com o texto "Nova versão disponível — Atualizar". Tocar nela envia `"pular-espera"`, e o `controllerchange` faz `location.reload()`. Na primeira execução, chama `navigator.storage?.persist?.()`.
- [ ] **Step 5: `instalar.html`.** Página independente com o mesmo CSS, com as instruções do spec (seção 9) para Android/Chrome, iPhone/Safari e PC/Chrome ou Edge, e um `<img src="icons/qrcode.png">`. Se a imagem ainda não existir, mostra o texto alternativo "O QR Code será gerado na publicação".
- [ ] **Step 6: Verificar no navegador.**
  - O Chrome DevTools → Application mostra o manifest sem erros e o service worker ativado.
  - Com a opção Offline marcada, ao recarregar o app abre e mostra os dados.
  - Mude `VERSAO` para `"cc-v2"` e recarregue: deve aparecer "Nova versão disponível — Atualizar". Ao clicar, a página recarrega e os dados continuam lá. Depois volte para `"cc-v1"`.
- [ ] **Step 7: Commit** — `git add . && git commit -m "feat: PWA instalável e offline"`

---

### Task 11: Equivalência com a planilha, README e roteiro de publicação

**Files:**
- Create: `tests/equivalencia.test.js`, `README.md`

**Interfaces:**
- Consumes: `resumoAno` e `porCategoria` (Task 3).

- [ ] **Step 1: Montar o caso de equivalência.**
  - Lançamentos fixos, gravados no teste: 3 meses, cerca de 15 itens, com saldo de abertura de R$ 500,00.
  - Os mesmos dados são digitados numa cópia da planilha original. Use o openpyxl do venv do scratchpad para preencher as células e o LibreOffice headless, se disponível, para recalcular. Se não houver LibreOffice, peça ao professor para abrir a cópia no Excel e informar os totais.
  - Os valores esperados copiados da planilha recalculada (Resumo B3:B7, linhas 11–13 e as categorias com valor) entram no teste com `assertEqual`.
- [ ] **Step 2: Rodar `testes.html`.** Expected: `0 falharam`, incluindo a equivalência.
- [ ] **Step 3: Escrever o `README.md` para o professor.**
  - (1) rodar localmente com `python3 -m http.server 8000`;
  - (2) criar o repositório `controle-custos` no GitHub, fazer o push e ativar o Pages em Settings → Pages → Branch `main` / root;
  - (3) gerar o QR Code do endereço publicado e salvar como `icons/qrcode.png`;
  - (4) publicar uma atualização: editar, subir `VERSAO` em `sw.js` e fazer o push;
  - (5) o roteiro de testes manuais da seção 10 do spec (Android, iPhone e PC; modo avião; backup em outro aparelho; aviso de atualização), como uma lista de verificação.
- [ ] **Step 4: Commit** — `git add . && git commit -m "test: equivalência com a planilha; docs: README de publicação"`
