export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const

export const PLANO_CONTAS = {
  receitas: ['Receita Produtos', 'Receita Serviços'],
  custoVenda: ['CMV', 'Comissões'],
  despesasFixas: ['Aluguel', 'Água', 'Luz', 'Contabilidade', 'Impostos'],
  despesasVariaveis: ['Software', 'Internet', 'Telefone'],
  despesasOutras: ['Empréstimos', 'Retiradas'],
} as const

export const TODAS_CONTAS = [
  ...PLANO_CONTAS.receitas,
  ...PLANO_CONTAS.custoVenda,
  ...PLANO_CONTAS.despesasFixas,
  ...PLANO_CONTAS.despesasVariaveis,
  ...PLANO_CONTAS.despesasOutras,
] as const

export type TipoLancamento = 'R' | 'D'
export type StatusPagamento = 'PAGO' | 'PENDENTE'

export interface Lancamento {
  id: string
  dataPagamento: string
  mes: number
  tipo: TipoLancamento
  planoContas: string
  descricao: string
  valor: number
  status: StatusPagamento
}

const STORAGE_KEY = 'meu-mei-pro-lancamentos'

export function getLancamentos(): Lancamento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setLancamentos(lancamentos: Lancamento[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentos))
}
