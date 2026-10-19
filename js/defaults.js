// Categorias iniciais e serviços de referência, copiados da aba Categorias da planilha original.

const CUSTOS = [
  "Aluguel", "Energia elétrica", "Água e saneamento", "Internet e telefone", "Salários e encargos",
  "Honorários contador", "Produtos e insumos", "Materiais didáticos", "Comissões", "Marketing e publicidade",
  "Material de limpeza", "Manutenção de equipamentos", "Transporte", "Combustível", "Alimentação",
  "Material de escritório", "Material de expediente", "Software e licenças", "Equipamentos e peças",
  "Ferramentas e instrumentos", "Serviços terceirizados", "Taxas e impostos", "Capacitação e cursos",
  "Seguros", "Despesas bancárias", "Outros custos",
];

const RECEITAS = [
  "Serviços prestados", "Venda de produtos", "Pacotes e planos", "Assinaturas e mensalidades",
  "Aulas e treinamentos", "Oficinas e workshops", "Projetos e consultorias", "Eventos e feiras",
  "Doações e patrocínios", "Outras receitas",
];

export const SERVICOS_REFERENCIA = [
  "Sessão de massagem", "Sessão de estética", "Oficina de robótica", "Manutenção de redes",
  "Instalação de redes", "Suporte técnico", "Aula particular", "Treinamento em grupo",
  "Pacote de sessões", "Consultoria", "Venda de kit ou produto", "Outro serviço",
];

export function slug(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const categoria = (prefixo, tipo) => (nome) => ({ id: `${prefixo}_${slug(nome)}`, nome, tipo, natureza: null, ativa: true });

export const CATEGORIAS_PADRAO = [
  ...CUSTOS.map(categoria("c", "custo")),
  ...RECEITAS.map(categoria("r", "receita")),
];

export function criarDocumentoInicial() {
  return {
    versao: 1,
    categorias: CATEGORIAS_PADRAO.map((c) => ({ ...c })),
    anos: {},
    lancamentos: [],
    ultimoBackup: null,
  };
}
