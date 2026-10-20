// Dados do relatório para impressão (função pura, sem DOM). Valores em centavos.
// A lista respeita o filtro de tipo; os subtotais do mês e o resumo do período são sempre completos,
// porque o saldo depende de receitas e custos juntos.
import { resumoMes, lancamentosDoMes } from "./calc.js";
import { NOMES_MESES } from "./ui.js";

const SUBTITULOS = { todos: "Receitas e custos", receita: "Somente receitas", custo: "Somente custos" };

export function montarRelatorio(doc, { ano, mesInicio, mesFim, tipo = "todos" }) {
  if (mesFim < mesInicio) return { ok: false, erro: "O mês final deve ser igual ou posterior ao mês inicial" };

  const nomes = new Map(doc.categorias.map((c) => [c.id, c.nome]));
  const periodo = mesInicio === mesFim
    ? `${NOMES_MESES[mesInicio - 1]} de ${ano}`
    : `${NOMES_MESES[mesInicio - 1]} a ${NOMES_MESES[mesFim - 1]} de ${ano}`;

  const meses = [];
  for (let mes = mesInicio; mes <= mesFim; mes++) {
    const { receitas, despesas } = resumoMes(doc, ano, mes);
    meses.push({
      mes,
      nome: `${NOMES_MESES[mes - 1]} de ${ano}`,
      receitas,
      custos: despesas,
      lancamentos: lancamentosDoMes(doc, ano, mes, tipo).map((l) => ({
        data: l.data,
        tipo: l.tipo,
        categoria: nomes.get(l.categoriaId) ?? "(sem categoria)",
        descricao: l.descricao,
        valor: l.valor,
      })),
    });
  }

  const receitas = meses.reduce((s, m) => s + m.receitas, 0);
  const custos = meses.reduce((s, m) => s + m.custos, 0);
  return {
    ok: true,
    titulo: `Relatório de lançamentos — ${periodo}`,
    subtitulo: SUBTITULOS[tipo],
    tipo,
    meses,
    totais: {
      saldoInicial: resumoMes(doc, ano, mesInicio).saldoAnterior,
      receitas,
      custos,
      resultado: receitas - custos,
      saldoFinal: resumoMes(doc, ano, mesFim).saldoFinal,
    },
  };
}
