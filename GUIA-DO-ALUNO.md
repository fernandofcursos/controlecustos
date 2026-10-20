# Guia do aluno — Controle de Custos

App para controlar as **receitas** (o que entra) e os **custos** (o que sai) do seu negócio ou projeto, mês a mês. Ele faz as mesmas contas da planilha do curso.

**Endereço do app:** https://fernandofcursos.github.io/controlecustos/

> **Importante:** seus dados ficam **só no seu aparelho**. Ninguém mais vê os seus lançamentos, nem o professor. Por isso, faça **backup** com frequência (veja o item 6).

---

## 1. Instalar o app

### Android (Chrome)
1. Abra o endereço acima no **Chrome**.
2. Toque no menu **⋮**, no canto superior direito.
3. Toque em **Instalar app** (ou **Adicionar à tela inicial**) e confirme.

### iPhone ou iPad (Safari)
1. Abra o endereço no **Safari**. No Chrome do iPhone ou dentro do WhatsApp não funciona.
2. Toque em **Compartilhar** (o quadrado com uma seta para cima).
3. Toque em **Adicionar à Tela de Início** e depois em **Adicionar**.
4. Abra o app **sempre pelo ícone** na tela de início.

### Computador (Chrome ou Edge)
1. Abra o endereço.
2. Clique no ícone de **instalar** no fim da barra de endereço.

Depois de instalado, o app funciona **sem internet**.

---

## 2. Conhecer o app com dados de exemplo

1. Toque em **Ajustes** (barra de baixo).
2. Toque em **Carregar exemplo em 2026**. O ano muda conforme o ano escolhido.
3. Explore as telas **Mês** e **Resumo**.
4. Quando terminar, volte em **Ajustes** e toque em **Remover exemplos**. Só os dados de exemplo são apagados.

---

## 3. Informar o saldo inicial

Antes de começar, informe quanto dinheiro o negócio já tinha (caixa ou banco) em 1º de janeiro:

1. **Ajustes → Saldo de abertura** → digite o valor (por exemplo, `1.500,00`) → **Salvar**.
2. Se o negócio começou devendo, use um valor negativo, como `-200,00`.

A partir do segundo ano, o saldo de abertura vem automaticamente de dezembro do ano anterior.

---

## 4. Lançar receitas e custos

1. Toque no botão **+** (azul, no canto da tela).
2. Escolha **Receita** ou **Custo**.
3. Preencha:
   - **Valor:** por exemplo `180,00` ou `1.500`.
   - **Data:** quando o dinheiro entrou ou saiu.
   - **Categoria:** escolha na lista, como Aluguel, Energia elétrica, Serviços prestados…
   - **Descrição** (opcional): por exemplo, "Conta de luz da sala". Nas receitas aparecem sugestões, como "Oficina de robótica".
4. Toque em **Salvar**.

Para **corrigir ou excluir** um lançamento, toque nele na lista do mês. Depois altere os campos e toque em **Salvar**, ou toque em **Excluir**.

**Dica:** lance os movimentos pelo menos uma vez por semana e guarde os comprovantes (notas fiscais e recibos).

---

## 5. Acompanhar os resultados

### Tela Mês
- Use as setas **‹ ›** para trocar de mês.
- Os quatro quadros mostram:
  - **Saldo do mês anterior**
  - **Receitas do mês**
  - **Despesas do mês**
  - **Saldo final do mês**: verde quando é positivo e vermelho quando é negativo.
- No celular, os botões **Todos / Receitas / Custos** filtram a lista.

### Tela Resumo
Mostra o ano inteiro:
- total de receitas e de despesas, **lucro** e **margem de lucro**;
- gráfico de receitas x despesas por mês;
- **custos por categoria** e **receitas por categoria**, com a porcentagem de cada uma;
- tabela mês a mês com o saldo acumulado.

### Tela Categorias
- **+** cria uma categoria nova.
- **Renomear** muda o nome. Os lançamentos antigos acompanham a mudança.
- **— / Fixo / Variável** classifica o custo. É útil para estudar custos fixos e variáveis.
- **Desativar** tira a categoria da lista de lançamento, mas os valores já lançados continuam no Resumo.
- **Excluir** só aparece para categorias que nunca foram usadas.

---

## 6. Backup: não perca seus dados

Se você trocar de celular, limpar os dados do navegador ou desinstalar o app, **perde tudo**, a menos que tenha um backup.

**Fazer backup:**
1. **Ajustes → Fazer backup**.
2. O app gera um arquivo `controle-custos-backup-AAAA-MM-DD.json`. Guarde esse arquivo no Google Drive, no e-mail ou no WhatsApp ("mensagem para mim mesmo").

**Restaurar o backup** (num aparelho novo, por exemplo):
1. Instale o app e abra **Ajustes → Restaurar backup**.
2. Escolha o arquivo `.json`.
3. Confira o resumo ("N lançamentos, anos …") e confirme.

O app mostra um aviso quando você passa **mais de 30 dias** sem fazer backup.

---

## 7. Entregar ao professor (Excel)

1. **Ajustes → Exportar 2026 para Excel**. O ano muda conforme o ano escolhido.
2. O app gera `controle-custos-2026.xlsx`, com as abas **Resumo, Categorias e Jan a Dez**, no mesmo formato da planilha do curso.
3. Envie o arquivo da forma que o professor pedir.

---

## 8. Imprimir ou salvar em PDF

1. Toque em **Resumo** e depois em **Relatório para imprimir**.
2. Escolha o **Ano**, o **Mês inicial** e o **Mês final** (por exemplo, Março a Junho) e quais **Lançamentos** entram: **Todos**, **Só receitas** ou **Só custos**.
3. Confira a prévia logo abaixo:
   - os lançamentos de cada mês, com subtotal;
   - no fim, o **Resumo do período**: saldo no início, receitas, custos, resultado e saldo no fim.
4. Toque em **Imprimir / Salvar PDF**.
   - **Computador e Android:** na janela de impressão, escolha a impressora ou **Salvar como PDF**.
   - **iPhone:** na janela que abrir, toque em **Compartilhar** (ou faça o gesto de "pinça" na prévia) e salve ou envie o PDF.

Os valores aparecem no padrão brasileiro, por exemplo **R$ 12.345,67**.

---

## 9. Dúvidas comuns

| Situação | O que fazer |
|---|---|
| Apareceu **"Nova versão disponível — Atualizar"** | Toque no aviso. O app é atualizado e seus dados continuam lá. |
| Apareceu **"Faça um backup dos seus dados"** | Vá em **Ajustes → Fazer backup**. |
| Apareceu **"Não foi possível salvar neste navegador"** | O navegador está bloqueando o armazenamento (por exemplo, numa aba anônima). Abra o app instalado, fora da aba anônima, e faça um backup. |
| Não encontro uma categoria ao lançar | Ela pode estar desativada. Vá em **Categorias** e toque em **Ativar**. |
| Quero recomeçar do zero | **Ajustes → Apagar todos os dados**. Faça um backup antes, se quiser guardar alguma coisa. |

---

Centro de Educação Profissional de Santa Maria — Curso de Administração
