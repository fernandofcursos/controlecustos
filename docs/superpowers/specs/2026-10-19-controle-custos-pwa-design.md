# Controle de Custos — App PWA (design)

Data: 2026-10-19
Origem: planilha `CONTROLE DE CUSTOS - CEP ETSM.xlsx` (Centro de Educação Profissional de Santa Maria — Curso de Administração)

## 1. Objetivo

Transformar a planilha de controle mensal de receitas e despesas em um app didático que os alunos instalam no celular ou no computador **sem passar por loja de aplicativos**. Cada aluno controla o fluxo de caixa do próprio negócio ou projeto (real ou simulado).

### Critérios de sucesso

- O aluno abre um link ou QR Code, instala o app e o usa **offline** no Android, no iPhone e no PC.
- Com os mesmos lançamentos, o app chega aos mesmos totais da planilha.
- O aluno consegue fazer backup e restaurar os dados, e também exportar para Excel.
- O professor publica atualizações sem que os alunos percam dados.

### Decisões do professor

| Tema | Decisão |
|---|---|
| Dados | Ficam só no aparelho do aluno. Sem login, sem servidor e sem painel do professor. |
| Aparelhos | Celular (Android e iPhone) e computador. |
| Fidelidade | Mesma lógica da planilha, com mais liberdade: qualquer ano, sem limite de linhas, categorias editáveis, gráficos e dados de exemplo. |
| Caminho | App web instalável (PWA) hospedado no GitHub Pages. |

### Fora do escopo

Login, sincronização entre aparelhos, painel do professor, várias empresas por aluno e anexos de comprovantes.

## 2. Arquitetura

- **HTML, CSS e JavaScript puro** com módulos ES. Sem framework e sem etapa de build, para que o professor ou a equipe de TI consigam editar os arquivos diretamente.
- **Bibliotecas copiadas para dentro do projeto** (pasta `vendor/`, para funcionar offline): Chart.js (gráficos) e SheetJS (exportar `.xlsx`).
- **Service worker**: guarda todos os arquivos do app em cache para uso offline e avisa quando há uma nova versão.
- **Web App Manifest**: nome "Controle de Custos", ícones de 192 e 512 px, `display: standalone` e cor do tema.
- **Persistência**: um único documento JSON no `localStorage`, na chave `controleCustos.v1`. Na primeira execução o app chama `navigator.storage.persist()`.

### Estrutura de arquivos

```
index.html            casca do app (navegação e área das telas)
manifest.webmanifest
sw.js                 service worker (cache versionado)
css/app.css           estilos, mobile-first, layout desktop por media query
js/app.js             inicialização, roteamento por hash (#mes, #resumo, #categorias, #ajustes)
js/store.js           carregar/salvar/migrar o documento; única porta de acesso ao localStorage
js/calc.js            funções puras de cálculo (sem DOM) — alvo principal dos testes
js/format.js          moeda pt-BR, datas dd/mm/aaaa, conversão reais <-> centavos
js/defaults.js        categorias iniciais e serviços de referência da planilha
js/exemplo.js         gerador de dados de exemplo
js/backup.js          exportar/importar JSON com validação
js/excel.js           exportar .xlsx no formato da planilha
js/views/mes.js
js/views/lancamento.js
js/views/resumo.js
js/views/categorias.js
js/views/ajustes.js
vendor/chart.umd.min.js
vendor/xlsx.full.min.js
icons/
instalar.html         instruções de instalação (Android, iPhone, PC)
testes.html           executor de testes no navegador
tests/*.test.js
```

Os limites entre as unidades são estes:
- As views leem e gravam dados **somente** por meio do `store.js`.
- Todos os números exibidos vêm do `calc.js`.
- O `calc.js` não conhece o DOM nem o armazenamento.

## 3. Modelo de dados

```js
{
  versao: 1,
  categorias: [
    { id: "c_aluguel", nome: "Aluguel", tipo: "custo", natureza: null, ativa: true }
    // tipo: "receita" | "custo"; natureza: "fixo" | "variavel" | null
  ],
  anos: {
    "2026": { saldoAbertura: 0 }          // centavos
  },
  lancamentos: [
    { id: "l_…", tipo: "custo", data: "2026-03-12", categoriaId: "c_energia",
      descricao: "Conta de luz", valor: 18000, exemplo: false }   // valor em centavos
  ],
  ultimoBackup: null                       // ISO date ou null
}
```

- **O mês e o ano vêm de `data`.** Não existem abas e não há limite de linhas.
- **As categorias são referenciadas por `id`.** Renomear uma categoria atualiza todo o histórico.
- **Uma categoria em uso não é apagada, só fica com `ativa: false`.** Ela sai da lista de escolha, mas continua contando nos relatórios. Uma categoria sem nenhum lançamento pode ser excluída de verdade.
- **Categorias iniciais**: as 26 de custo e as 10 de receita da aba Categorias, com `natureza: null`. A planilha não associa Fixo/Variável a cada categoria, então o aluno classifica se quiser.
- **Serviços de referência** (12 itens da coluna H): ficam em `defaults.js` como sugestões para a descrição, sem ir para o documento salvo.
- **`versao`**: o `store.js` aplica migrações quando o formato mudar no futuro.

## 4. Telas

Navegação no celular: uma barra inferior com as abas Mês, Resumo, Categorias e Ajustes, e um botão flutuante **+** para lançar. No computador (≥ 900 px), a navegação vira um menu lateral e a tela Mês mostra Receitas e Custos em duas colunas.

1. **Mês**
   - Setas para trocar de mês (passar de dezembro leva a janeiro do ano seguinte).
   - Painel com saldo anterior, receitas, despesas e saldo final. O saldo final fica verde quando ≥ 0 e vermelho quando < 0.
   - Filtro Todos / Receitas / Custos.
   - Lista ordenada por data, mostrando descrição, data, categoria e valor com sinal e cor.
   - Tocar num item abre a edição.
2. **Lançamento** (criar e editar)
   - Escolha entre Receita e Custo.
   - Campo Valor com teclado numérico.
   - Data, que vem com hoje quando o mês exibido é o atual e com o dia 1 do mês exibido nos outros casos.
   - Categoria: só as ativas do tipo escolhido.
   - Descrição, com sugestões dos serviços de referência quando o tipo é Receita.
   - Botões Salvar e, na edição, Excluir (pede confirmação).
3. **Resumo** (do ano selecionado)
   - Lucro do ano, margem, totais de receitas e de despesas e saldo final acumulado.
   - Gráfico de barras com receitas x despesas por mês.
   - Custos por categoria e receitas por categoria, com total e %, só as que têm valor e em ordem decrescente.
   - Tabela mês a mês com receitas, despesas, lucro e saldo acumulado.
4. **Categorias**
   - Alternância entre Receitas e Custos.
   - Criar categoria, renomear, definir Fixo/Variável/nenhuma e ativar/desativar.
   - Excluir aparece só para categorias sem lançamentos.
5. **Ajustes**
   - Seletor de ano: os anos com dados, mais o ano atual.
   - Saldo de abertura do ano. Quando o ano anterior tem dados, o campo mostra o valor herdado e fica bloqueado. Veja a seção 5.
   - Carregar exemplo / Remover exemplos.
   - Fazer backup / Restaurar backup / Exportar para Excel.
   - Apagar todos os dados (pede confirmação dupla).
   - Link para "Como instalar" e o rodapé de créditos do CEP Santa Maria.

## 5. Cálculos (`calc.js`)

Todos os valores são inteiros em centavos. Para o ano A e o mês M (1–12):

- `receitas(A,M)` = soma de `valor` dos lançamentos `tipo = "receita"` com data em A/M.
- `despesas(A,M)` = o mesmo para `tipo = "custo"`.
- `saldoAnterior(A,1)` = `saldoAbertura(A)`.
- `saldoAnterior(A,M>1)` = `saldoFinal(A,M−1)`.
- `saldoFinal(A,M)` = `saldoAnterior(A,M) + receitas(A,M) − despesas(A,M)`.
- `saldoAbertura(A)`:
  - se existir qualquer lançamento no ano A−1, ou se A−1 tiver `saldoAbertura` registrado, vale `saldoFinal(A−1,12)`, e o campo fica bloqueado na tela;
  - caso contrário, vale `anos[A].saldoAbertura`, ou 0 se não houver registro.
- Resumo do ano:
  - `totalReceitas` = Σ receitas(A, 1..12);
  - `totalDespesas` = Σ despesas(A, 1..12);
  - `lucro` = totalReceitas − totalDespesas;
  - `margem` = lucro / totalReceitas, que vale 0 quando totalReceitas = 0;
  - `saldoAcumulado` = saldoFinal(A,12).
- Por categoria: total da categoria no ano e `%` = total / soma de todas as categorias do mesmo tipo, que vale 0 quando a soma é 0.

Esses cálculos equivalem às fórmulas da planilha: `C4`, `D4` e `E4` de cada mês, e `B3:B7`, as linhas 11–23, 27–53 e 57–67 da aba Resumo.

## 6. Regras de validação

- `valor` precisa ser > 0. A entrada aceita "1.234,56", "1234,56" e "1234.56", e é convertida para centavos com arredondamento.
- `data` deve ser uma data válida. `categoriaId` deve existir e combinar com o `tipo`.
- `descricao` é opcional e tem no máximo 100 caracteres.
- Os erros aparecem ao lado de cada campo, e o lançamento não é salvo enquanto houver erro.
- Saldos negativos são permitidos.

## 7. Dados de exemplo (`exemplo.js`)

- "Carregar exemplo" gera, para o ano selecionado, de 4 a 6 receitas e de 6 a 10 custos por mês. Inclui custos fixos todo mês (aluguel, internet, honorários do contador) e variáveis aleatórios com semente fixa, para que o resultado seja reprodutível.
- As receitas usam as categorias de receita e os serviços de referência como descrição.
- Todos os lançamentos gerados ficam com `exemplo: true`. "Remover exemplos" apaga só esses.
- Se o ano já tiver exemplos, carregar de novo pede confirmação e substitui os exemplos anteriores.

## 8. Backup e exportação

- **Fazer backup**: baixa o documento inteiro como `controle-custos-backup-AAAA-MM-DD.json` e atualiza `ultimoBackup`.
- **Restaurar**:
  - lê o arquivo e confere a estrutura (`versao`, arrays, tipos e categorias referenciadas);
  - se o arquivo for inválido, mostra "Arquivo inválido ou corrompido" e não altera nada;
  - se for válido, mostra um resumo (nº de lançamentos e anos) e pede confirmação antes de substituir tudo.
- **Aviso**: um banner discreto aparece quando há lançamentos e `ultimoBackup` está vazio ou tem mais de 30 dias.
- **Exportar para Excel** (`excel.js`): gera `controle-custos-AAAA.xlsx` com as abas Resumo, Categorias e Jan–Dez. Cada aba de mês tem o painel e as tabelas de Receitas e Custos. Os valores saem calculados, sem fórmulas.

## 9. Distribuição e atualização

- Hospedagem no GitHub Pages, na conta do professor (por exemplo `usuario.github.io/controle-custos`).
- `instalar.html` traz as instruções por plataforma e um QR Code do endereço, gerado uma vez e salvo como imagem em `icons/qrcode.png`.
- O service worker usa um nome de cache com versão (`cc-v1`, `cc-v2`…). Quando encontra uma versão nova, o app mostra "Nova versão disponível — Atualizar". Os dados no `localStorage` não são tocados.

## 10. Testes

- **Automáticos**: `testes.html` roda `tests/*.test.js` no navegador, com um mini-executor de asserções próprio e sem dependências. Os casos são:
  - o saldo que passa de um mês para o outro, inclusive de dezembro para janeiro do ano seguinte;
  - a margem com receita zero;
  - os percentuais com total zero;
  - a conversão "1.234,56" → 123456 e o arredondamento;
  - um lançamento que muda de ano ao ter a data editada;
  - um backup que, depois de exportado e importado, volta idêntico;
  - a rejeição de backup inválido;
  - desativar uma categoria em uso sem que ela saia do resumo;
  - "Remover exemplos" preservando os dados do aluno.
- **Equivalência com a planilha**: um conjunto fixo de lançamentos é digitado na planilha original e no app, e os totais de Resumo, mês a mês e por categoria devem bater.
- **Manuais** (roteiro antes de distribuir):
  - instalar no Android/Chrome, no iPhone/Safari e no PC/Chrome ou Edge;
  - lançar, fechar e reabrir em modo avião;
  - fazer backup e restaurar em outro aparelho;
  - publicar uma versão nova e conferir o aviso de atualização sem perda de dados.
