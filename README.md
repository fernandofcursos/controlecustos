# Controle de Custos — app para os alunos

App instalável (PWA) feito a partir da planilha **CONTROLE DE CUSTOS - CEP ETSM.xlsx**.
É distribuído por link ou QR Code, sem loja de aplicativos, e funciona sem internet. Os dados de cada aluno ficam só no aparelho dele.

Centro de Educação Profissional de Santa Maria — Curso de Administração.

---

## 1. Rodar no seu computador

No Terminal, dentro da pasta do projeto:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000` no Chrome. Abrir o `index.html` com dois cliques não funciona, porque o navegador bloqueia os módulos JavaScript fora de um servidor.

- **Testes no navegador:** `http://localhost:8000/testes.html` deve mostrar "N passaram, 0 falharam".
- **Testes no Terminal (Mac):** `./testar.sh`

## 2. Publicar no GitHub Pages (grátis)

O passo a passo completo está em **[PUBLICAR.md](PUBLICAR.md)**: enviar ao GitHub (pelo GitHub Desktop ou pelo Terminal), deixar o repositório público, ativar o Pages e testar o endereço publicado.

Endereço do app: **https://fernandofcursos.github.io/controlecustos/**

## 3. QR Code e entrega aos alunos

Veja os [Passos 5 e 6 do PUBLICAR.md](PUBLICAR.md#passo-5--gerar-o-qr-code). Para os alunos, envie o **[GUIA-DO-ALUNO.md](GUIA-DO-ALUNO.md)**: instalação, lançamentos, resumo, backup e Excel.

## 4. Publicar uma atualização

Veja o [Passo 7 do PUBLICAR.md](PUBLICAR.md#passo-7--publicar-uma-atualização-do-app). Em resumo: edite os arquivos, aumente a `VERSAO` no `sw.js`, rode `./testar.sh` e faça commit e push.

## 5. Roteiro de testes antes de distribuir

- [ ] **Android (Chrome):** abrir o link, menu ⋮ → Instalar app. O ícone aparece na tela inicial.
- [ ] **iPhone (Safari):** Compartilhar → Adicionar à Tela de Início. O app abre em tela cheia.
- [ ] **Computador (Chrome ou Edge):** ícone de instalar na barra de endereço.
- [ ] Lançar uma receita e um custo, fechar o app e reabrir: os dados continuam lá.
- [ ] Ativar o **modo avião** e abrir o app: ele funciona normalmente.
- [ ] Em Ajustes, **Fazer backup**, enviar o arquivo para outro aparelho, abrir o app nele e usar **Restaurar backup**: os dados aparecem.
- [ ] Publicar uma versão nova (passo 4) e conferir o aviso de atualização, sem perda de dados.
- [ ] **Resumo → Relatório para imprimir**: escolher março a junho, só custos, e salvar como PDF; conferir os valores em R$.
- [ ] **Exportar para Excel** e abrir o arquivo no Excel: 14 abas (Resumo, Categorias, Jan a Dez).

## 6. Orientações para os alunos

O guia completo para os alunos é o [GUIA-DO-ALUNO.md](GUIA-DO-ALUNO.md). O essencial:


- Os dados ficam **só no seu aparelho**. Se você limpar os dados do navegador ou trocar de celular, perde tudo, a menos que tenha um backup. Faça backup com frequência (Ajustes → Fazer backup) e guarde o arquivo no Drive, no e-mail ou no WhatsApp.
- No iPhone, abra sempre pelo ícone da tela de início. Assim o sistema mantém seus dados.
- Para ver como o app funciona, use **Ajustes → Carregar exemplo**. Depois, **Remover exemplos** apaga só os dados de exemplo.

## Estrutura do projeto

| Arquivo | Função |
|---|---|
| `index.html`, `css/app.css` | Casca do app e estilos (mobile-first; menu lateral a partir de 900 px) |
| `js/app.js` | Inicialização, rotas (`#mes`, `#resumo`, `#categorias`, `#ajustes`, `#lancamento`), atualização |
| `js/store.js` | Única porta para o armazenamento do navegador (`localStorage`, chave `controleCustos.v1`) |
| `js/calc.js` | Cálculos, equivalentes às fórmulas da planilha |
| `js/format.js` | Moeda (R$), datas, conversão para centavos |
| `js/validacao.js`, `js/backup.js`, `js/exemplo.js`, `js/excel.js`, `js/relatorio.js` | Validação, backup, dados de exemplo, exportação para Excel, relatório para imprimir/PDF |
| `js/views/*.js` | Telas |
| `sw.js`, `manifest.webmanifest`, `icons/` | Instalação e funcionamento offline |
| `vendor/` | Chart.js 4.4.1 (gráficos) e SheetJS 0.18.5 (Excel), guardados no projeto para funcionar offline |
| `tests/`, `testes.html`, `testar.sh` | Testes automáticos |
| `PUBLICAR.md`, `GUIA-DO-ALUNO.md` | Passo a passo de publicação (professor) e guia de uso (alunos) |
| `docs/superpowers/` | Especificação e plano de implementação |
