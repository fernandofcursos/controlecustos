# Como publicar o app no GitHub Pages

Este guia é para o professor. Ao final, o app estará em:

**https://fernandofcursos.github.io/controlecustos/**

Os alunos abrem esse endereço, instalam o app no celular ou no computador e passam a usá-lo, inclusive sem internet. A publicação é gratuita e não passa por loja de aplicativos.

> Tempo estimado: 15 minutos na primeira vez e cerca de 2 minutos em cada atualização.

---

## Passo 1 — Enviar o projeto para o GitHub

O repositório `fernandofcursos/controlecustos` já existe no GitHub, mas ainda está vazio. É preciso enviar ("fazer push") os arquivos que estão no seu computador.

### Opção A: pelo GitHub Desktop (recomendado)

1. Abra o **GitHub Desktop** e confira se está conectado à conta **fernandofcursos**: menu **GitHub Desktop → Settings → Accounts** (no Windows, **File → Options → Accounts**).
2. Vá ao menu **File → Add Local Repository…**
3. Clique em **Choose…** e selecione a pasta do projeto:
   `OneDrive-Pessoal/Projetos/controlecustos`
4. Clique em **Add Repository**.
5. No topo da janela, clique em **Push origin** ou **Publish branch**.
6. Confira o resultado: abra <https://github.com/fernandofcursos/controlecustos>. Os arquivos (`index.html`, `js/`, `css/`…) devem aparecer na página.

### Opção B: pelo Terminal

1. No GitHub, crie um token em **foto do perfil → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)**. Marque a permissão **repo** e copie o token gerado.
2. No Terminal, dentro da pasta do projeto, rode:

   ```bash
   git push -u origin main
   ```

3. Quando o Terminal pedir **Username**, digite `fernandofcursos`. Quando pedir **Password**, cole o **token**, e não a sua senha do GitHub.

---

## Passo 2 — Deixar o repositório público

No plano gratuito, o GitHub Pages só funciona com repositórios **públicos**. Ficam visíveis apenas o código e os textos do projeto. **Os dados dos alunos nunca vão para o GitHub**: eles ficam só no aparelho de cada aluno.

1. Abra <https://github.com/fernandofcursos/controlecustos>.
2. Veja o selo ao lado do nome. Se estiver **Public**, siga para o Passo 3.
3. Se estiver **Private**, vá em **Settings**, role até o fim, abra **Danger Zone → Change repository visibility**, escolha **Change to public** e confirme.

---

## Passo 3 — Ativar o GitHub Pages

1. No repositório, clique em **Settings** (aba do topo) e, no menu lateral, em **Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
4. Espere de 1 a 3 minutos e recarregue a página. Deve aparecer a mensagem:
   **"Your site is live at https://fernandofcursos.github.io/controlecustos/"**
5. Para acompanhar a publicação, abra a aba **Actions** do repositório. O item **pages build and deployment** fica verde quando termina.

---

## Passo 4 — Testar o endereço publicado

1. Abra **https://fernandofcursos.github.io/controlecustos/** no Chrome. A tela **Mês** deve aparecer.
2. Abra **https://fernandofcursos.github.io/controlecustos/testes.html**. Deve aparecer **"52 passaram, 0 falharam"**. Se o número de testes mudar em versões futuras, o que importa é **0 falharam**.
3. No celular, faça o roteiro de testes do [README.md](README.md#5-roteiro-de-testes-antes-de-distribuir): instalar, lançar, usar no modo avião, fazer backup e exportar para Excel. Faça isso **num iPhone e num Android** antes de passar para a turma.

---

## Passo 5 — Gerar o QR Code

1. No Chrome do computador, abra **https://fernandofcursos.github.io/controlecustos/**.
2. Clique com o botão direito na página e escolha **Criar código QR para esta página**. Também funciona pelo ícone de compartilhar na barra de endereço. Depois clique em **Baixar**.
3. Renomeie o arquivo para **`qrcode.png`** e coloque-o na pasta **`icons/`** do projeto. Se já existir um arquivo com esse nome, substitua.
4. Publique a mudança, sem precisar mudar a versão do app:
   - **GitHub Desktop:** escreva um resumo como "Adiciona QR Code", clique em **Commit to main** e depois em **Push origin**.
   - **Terminal:**

     ```bash
     git add icons/qrcode.png && git commit -m "Adiciona QR Code" && git push
     ```

5. Depois de 1 a 3 minutos, o QR Code aparece em **https://fernandofcursos.github.io/controlecustos/instalar.html**.

---

## Passo 6 — Entregar aos alunos

Envie ou projete:

- **O link do app:** https://fernandofcursos.github.io/controlecustos/
- **A página de instalação**, com o QR Code e as instruções: https://fernandofcursos.github.io/controlecustos/instalar.html
- **O guia do aluno:** https://github.com/fernandofcursos/controlecustos/blob/main/GUIA-DO-ALUNO.md

Dicas para a primeira aula:

- Peça que todos instalem o app na tela de início. No **iPhone**, isso só funciona pelo **Safari**.
- Peça para usarem **Ajustes → Carregar exemplo** para conhecer as telas e depois **Remover exemplos** antes de lançar os próprios dados.
- Reforce que **os dados ficam só no aparelho**. Quem trocar de celular ou limpar o navegador perde os dados, a menos que tenha feito backup em **Ajustes → Fazer backup**.

---

## Passo 7 — Publicar uma atualização do app

Sempre que você (ou alguém da equipe) alterar o app:

1. Faça as alterações nos arquivos.
2. Abra o arquivo **`sw.js`** e aumente o número da versão na linha 3:

   ```js
   const VERSAO = "cc-v1";   // antes
   const VERSAO = "cc-v2";   // depois (na próxima vez, cc-v3, e assim por diante)
   ```

   **Isso é obrigatório.** Sem essa mudança, os alunos continuam com a versão antiga guardada no aparelho.
3. Se você criou um arquivo novo (por exemplo, `js/views/relatorio.js`), acrescente o nome dele à lista `ARQUIVOS` no `sw.js`.
4. No Mac, rode os testes. O `testar.sh` também avisa se algum arquivo ficou fora da lista:

   ```bash
   ./testar.sh
   ```

   Deve aparecer **"0 falharam"**.
5. Publique:
   - **GitHub Desktop:** escreva o resumo, clique em **Commit to main** e depois em **Push origin**.
   - **Terminal:**

     ```bash
     git add -A && git commit -m "Descreva a mudança" && git push
     ```

6. Depois de 1 a 3 minutos, quando o aluno abrir o app, aparece no topo o aviso **"Nova versão disponível — Atualizar"**. Ao tocar no aviso, o app recarrega com a versão nova. **Os lançamentos do aluno não são apagados.**

---

## Problemas comuns

| O que acontece | Como resolver |
|---|---|
| **Erro 404** ao abrir o endereço | Espere 3 minutos após ativar o Pages. Confira em **Settings → Pages** se a branch é **main** e a pasta é **/ (root)**, e se o `index.html` aparece na raiz do repositório no GitHub. |
| A opção **Pages** pede um plano pago | O repositório está **privado**. Torne-o público (Passo 2). |
| Os alunos **não recebem a versão nova** | Você esqueceu de aumentar a `VERSAO` no `sw.js` (Passo 7). Aumente, faça o push e peça para os alunos abrirem o app. |
| O aviso de atualização **não aparece** | Feche o app por completo e abra de novo. O navegador verifica se há versão nova ao abrir. |
| No iPhone **não aparece "Adicionar à Tela de Início"** | O aluno está em outro navegador (Chrome, Instagram, WhatsApp). Abra o link no **Safari**. |
| O app **abre em branco** | Abra `.../testes.html` para ver se algum teste falha e confira se a pasta `vendor/` foi enviada ao GitHub. |
| Um aluno **perdeu os dados** | Só é possível recuperar com um arquivo de backup (**Ajustes → Restaurar backup**). Por isso, peça backups com frequência. |
| O **push** pede login e falha | Use o GitHub Desktop (Passo 1, opção A) ou um token no lugar da senha (opção B). |

---

## Resumo rápido (para as próximas vezes)

1. Editar os arquivos
2. Aumentar a `VERSAO` no `sw.js`
3. Rodar `./testar.sh`
4. Fazer commit e push (GitHub Desktop ou Terminal)
5. Esperar 1 a 3 minutos. Os alunos veem o aviso de atualização.
