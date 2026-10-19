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

1. Crie uma conta em <https://github.com>, se ainda não tiver.
2. Crie um repositório **público** chamado `controle-custos` (botão **New**). Não marque nenhuma opção de README.
3. Envie os arquivos. No Terminal, dentro da pasta do projeto, troque `SEU-USUARIO` pelo seu usuário do GitHub:

   ```bash
   git remote add origin https://github.com/SEU-USUARIO/controle-custos.git
   git push -u origin main
   ```

   Se o seu branch se chamar `master`, rode antes `git branch -M main`.
4. No GitHub, abra o repositório e vá em **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, depois **Branch: main** e pasta **/ (root)**, e clique em **Save**.
5. Depois de 1 ou 2 minutos, o app estará em `https://SEU-USUARIO.github.io/controle-custos/`.

## 3. QR Code para os alunos

1. Gere o QR Code do endereço publicado em qualquer gerador (por exemplo, o menu **Compartilhar → Criar código QR** do Chrome).
2. Salve a imagem como `icons/qrcode.png`.
3. Publique de novo (passo 4 abaixo).

A página `instalar.html` mostra o QR Code e as instruções de instalação. Projete essa página em aula ou imprima.

## 4. Publicar uma atualização

1. Faça as alterações nos arquivos.
2. Em `sw.js`, aumente a versão: `const VERSAO = "cc-v1";` passa a `"cc-v2"`, depois `"cc-v3"`, e assim por diante. **Sem isso, os alunos continuam com a versão antiga guardada no aparelho.**
3. Se criou um arquivo novo, inclua o nome dele na lista `ARQUIVOS` do `sw.js`. O `./testar.sh` avisa se faltar algum.
4. Rode `./testar.sh` e depois:

   ```bash
   git add -A && git commit -m "Atualização" && git push
   ```

Quando o aluno abrir o app, aparece **"Nova versão disponível — Atualizar"**. Ao tocar no aviso, o app recarrega. Os dados dele não são apagados.

## 5. Roteiro de testes antes de distribuir

- [ ] **Android (Chrome):** abrir o link, menu ⋮ → Instalar app. O ícone aparece na tela inicial.
- [ ] **iPhone (Safari):** Compartilhar → Adicionar à Tela de Início. O app abre em tela cheia.
- [ ] **Computador (Chrome ou Edge):** ícone de instalar na barra de endereço.
- [ ] Lançar uma receita e um custo, fechar o app e reabrir: os dados continuam lá.
- [ ] Ativar o **modo avião** e abrir o app: ele funciona normalmente.
- [ ] Em Ajustes, **Fazer backup**, enviar o arquivo para outro aparelho, abrir o app nele e usar **Restaurar backup**: os dados aparecem.
- [ ] Publicar uma versão nova (passo 4) e conferir o aviso de atualização, sem perda de dados.
- [ ] **Exportar para Excel** e abrir o arquivo no Excel: 14 abas (Resumo, Categorias, Jan a Dez).

## 6. Orientações para os alunos

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
| `js/validacao.js`, `js/backup.js`, `js/exemplo.js`, `js/excel.js` | Validação, backup, dados de exemplo, exportação para Excel |
| `js/views/*.js` | Telas |
| `sw.js`, `manifest.webmanifest`, `icons/` | Instalação e funcionamento offline |
| `vendor/` | Chart.js 4.4.1 (gráficos) e SheetJS 0.18.5 (Excel), guardados no projeto para funcionar offline |
| `tests/`, `testes.html`, `testar.sh` | Testes automáticos |
| `docs/superpowers/` | Especificação e plano de implementação |
