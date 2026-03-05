import { useMemo, useState } from 'react'
import type { Lancamento } from '../data/constants'
import { MESES, PLANO_CONTAS } from '../data/constants'
import './PainelFinancas.css'

interface PainelFinancasProps {
  lancamentos: Lancamento[]
}

const RECEITAS = [...PLANO_CONTAS.receitas]
const CUSTO_VENDA = [...PLANO_CONTAS.custoVenda]
const DESP_FIXAS = [...PLANO_CONTAS.despesasFixas]
const DESP_VAR = [...PLANO_CONTAS.despesasVariaveis]
const DESP_OUTRAS = [...PLANO_CONTAS.despesasOutras]

function formatValor(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatValorNegativo(n: number) {
  if (n < 0) return `(${formatValor(-n)})`
  return formatValor(n)
}

export function PainelFinancas({ lancamentos }: PainelFinancasProps) {
  const [ano, setAno] = useState(() => new Date().getFullYear())

  const { porMes, totais } = useMemo(() => {
    const porMes: Record<number, Record<string, number>> = {}
    for (let m = 0; m < 12; m++) porMes[m] = {}

    let receitaTotalAno = 0
    let despesaTotalAno = 0

    lancamentos.forEach((l) => {
      const data = new Date(l.dataPagamento)
      if (data.getFullYear() !== ano) return
      const mes = l.mes
      if (!porMes[mes][l.planoContas]) porMes[mes][l.planoContas] = 0
      const valor = l.tipo === 'R' ? l.valor : -l.valor
      porMes[mes][l.planoContas] += valor
      if (l.tipo === 'R') receitaTotalAno += l.valor
      else despesaTotalAno += l.valor
    })

    const totais = {
      receitaTotalAno,
      despesaTotalAno,
      saldoAno: receitaTotalAno - despesaTotalAno,
    }

    return { porMes, totais }
  }, [lancamentos, ano])

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(lancamentos.map((l) => new Date(l.dataPagamento).getFullYear()))
    anos.add(new Date().getFullYear())
    return Array.from(anos).sort((a, b) => b - a)
  }, [lancamentos])

  const valorMes = (mes: number, conta: string) => porMes[mes]?.[conta] ?? 0
  const totalMesReceitas = (mes: number) =>
    RECEITAS.reduce((s, c) => s + (valorMes(mes, c) > 0 ? valorMes(mes, c) : 0), 0)
  const totalMesCustoVenda = (mes: number) =>
    CUSTO_VENDA.reduce((s, c) => s + Math.abs(Math.min(0, valorMes(mes, c))), 0)
  const totalMesDespesas = (mes: number) =>
    [...DESP_FIXAS, ...DESP_VAR, ...DESP_OUTRAS].reduce(
      (s, c) => s + Math.abs(Math.min(0, valorMes(mes, c))),
      0
    )
  const totalMesDespesasGeral = (mes: number) =>
    totalMesCustoVenda(mes) + totalMesDespesas(mes)
  const saldoMes = (mes: number) => totalMesReceitas(mes) - totalMesDespesasGeral(mes)

  const saldoAcumulado = totais.receitaTotalAno - totais.despesaTotalAno

  return (
    <main className="painel-page">
      <div className="painel-toolbar">
        <div className="painel-ano">
          <label htmlFor="painel-ano-select">Ano:</label>
          <select id="painel-ano-select" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <span className="painel-scroll-hint" aria-hidden>Deslize horizontalmente para ver todos os meses</span>
      </div>
      <div className="table-wrap painel-table-wrap">
        <table className="painel-table">
          <thead>
            <tr>
              <th scope="col" className="th-categoria">Categoria</th>
              <th scope="col" className="th-acumulado">Acum. Ano</th>
              {MESES.map((m) => (
                <th key={m} scope="col" className="th-mes">{m.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="grupo">
              <td colSpan={14}>RECEITAS</td>
            </tr>
            {RECEITAS.map((conta) => (
              <tr key={conta}>
                <td className="col-categoria">{conta}</td>
                <td className="valor-positivo">
                  {formatValor(
                    lancamentos
                      .filter((l) => l.planoContas === conta && l.tipo === 'R' && new Date(l.dataPagamento).getFullYear() === ano)
                      .reduce((s, l) => s + l.valor, 0)
                  )}
                </td>
                {MESES.map((_, i) => (
                  <td key={i} className="valor-positivo">
                    {formatValor(valorMes(i, conta) > 0 ? valorMes(i, conta) : 0)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td className="col-categoria">Receita Total</td>
              <td className="valor-positivo">{formatValor(totais.receitaTotalAno)}</td>
              {MESES.map((_, i) => (
                <td key={i} className="valor-positivo">{formatValor(totalMesReceitas(i))}</td>
              ))}
            </tr>

            <tr className="grupo">
              <td colSpan={14}>CUSTO VENDA</td>
            </tr>
            {CUSTO_VENDA.map((conta) => (
              <tr key={conta}>
                <td className="col-categoria">{conta}</td>
                <td className="valor-negativo">
                  {formatValorNegativo(
                    -lancamentos
                      .filter((l) => l.planoContas === conta && l.tipo === 'D' && new Date(l.dataPagamento).getFullYear() === ano)
                      .reduce((s, l) => s + l.valor, 0)
                  )}
                </td>
                {MESES.map((_, i) => (
                  <td key={i} className="valor-negativo">
                    {valorMes(i, conta) < 0 ? formatValorNegativo(valorMes(i, conta)) : '0,00'}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td className="col-categoria">CUSTO VENDA</td>
              <td className="valor-negativo">
                {formatValorNegativo(
                  -CUSTO_VENDA.reduce(
                    (s, c) =>
                      s +
                      lancamentos
                        .filter((l) => l.planoContas === c && l.tipo === 'D' && new Date(l.dataPagamento).getFullYear() === ano)
                        .reduce((v, l) => v + l.valor, 0),
                    0
                  )
                )}
              </td>
              {MESES.map((_, i) => (
                <td key={i} className="valor-negativo">{formatValorNegativo(-totalMesCustoVenda(i))}</td>
              ))}
            </tr>

            <tr className="grupo">
              <td colSpan={14}>DESPESAS FIXAS</td>
            </tr>
            {DESP_FIXAS.map((conta) => (
              <tr key={conta}>
                <td className="col-categoria">{conta}</td>
                <td className="valor-negativo">
                  {formatValor(
                    lancamentos
                      .filter((l) => l.planoContas === conta && new Date(l.dataPagamento).getFullYear() === ano)
                      .reduce((s, l) => s + l.valor, 0)
                  )}
                </td>
                {MESES.map((_, i) => (
                  <td key={i}>
                    {formatValor(Math.abs(valorMes(i, conta)))}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td className="col-categoria">DESPESAS FIXAS</td>
              <td className="valor-negativo">
                {formatValor(
                  DESP_FIXAS.reduce(
                    (s, c) =>
                      s +
                      lancamentos
                        .filter((l) => l.planoContas === c && new Date(l.dataPagamento).getFullYear() === ano)
                        .reduce((v, l) => v + l.valor, 0),
                    0
                  )
                )}
              </td>
              {MESES.map((_, i) => (
                <td key={i}>{formatValor(DESP_FIXAS.reduce((s, c) => s + Math.abs(Math.min(0, valorMes(i, c))), 0))}</td>
              ))}
            </tr>

            <tr className="grupo">
              <td colSpan={14}>DESPESAS VARIÁVEIS</td>
            </tr>
            {DESP_VAR.map((conta) => (
              <tr key={conta}>
                <td className="col-categoria">{conta}</td>
                <td className="valor-negativo">
                  {formatValor(
                    lancamentos
                      .filter((l) => l.planoContas === conta && new Date(l.dataPagamento).getFullYear() === ano)
                      .reduce((s, l) => s + l.valor, 0)
                  )}
                </td>
                {MESES.map((_, i) => (
                  <td key={i}>{formatValor(Math.abs(Math.min(0, valorMes(i, conta))))}</td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td className="col-categoria">DESPESAS VARIÁVEIS</td>
              <td className="valor-negativo">
                {formatValor(
                  DESP_VAR.reduce(
                    (s, c) =>
                      s +
                      lancamentos
                        .filter((l) => l.planoContas === c && new Date(l.dataPagamento).getFullYear() === ano)
                        .reduce((v, l) => v + l.valor, 0),
                    0
                  )
                )}
              </td>
              {MESES.map((_, i) => (
                <td key={i}>{formatValor(DESP_VAR.reduce((s, c) => s + Math.abs(Math.min(0, valorMes(i, c))), 0))}</td>
              ))}
            </tr>

            <tr className="grupo">
              <td colSpan={14}>DESPESAS OUTRAS</td>
            </tr>
            {DESP_OUTRAS.map((conta) => (
              <tr key={conta}>
                <td className="col-categoria">{conta}</td>
                <td className="valor-negativo">
                  {formatValor(
                    lancamentos
                      .filter((l) => l.planoContas === conta && new Date(l.dataPagamento).getFullYear() === ano)
                      .reduce((s, l) => s + l.valor, 0)
                  )}
                </td>
                {MESES.map((_, i) => (
                  <td key={i}>{formatValor(Math.abs(Math.min(0, valorMes(i, conta))))}</td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td className="col-categoria">DESPESAS OUTRAS</td>
              <td className="valor-negativo">
                {formatValor(
                  DESP_OUTRAS.reduce(
                    (s, c) =>
                      s +
                      lancamentos
                        .filter((l) => l.planoContas === c && new Date(l.dataPagamento).getFullYear() === ano)
                        .reduce((v, l) => v + l.valor, 0),
                    0
                  )
                )}
              </td>
              {MESES.map((_, i) => (
                <td key={i}>{formatValor(DESP_OUTRAS.reduce((s, c) => s + Math.abs(Math.min(0, valorMes(i, c))), 0))}</td>
              ))}
            </tr>

            <tr className="resumo-row">
              <td className="col-categoria">Total Receita</td>
              <td className="valor-positivo">{formatValor(totais.receitaTotalAno)}</td>
              {MESES.map((_, i) => (
                <td key={i} className="valor-positivo">{formatValor(totalMesReceitas(i))}</td>
              ))}
            </tr>
            <tr className="resumo-row">
              <td className="col-categoria">Total Despesas</td>
              <td className="valor-negativo">{formatValorNegativo(-totais.despesaTotalAno)}</td>
              {MESES.map((_, i) => (
                <td key={i} className="valor-negativo">{formatValorNegativo(-totalMesDespesasGeral(i))}</td>
              ))}
            </tr>
            <tr className="resumo-row saldo">
              <td className="col-categoria">Saldo Acumulado</td>
              <td className={saldoAcumulado >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                {formatValorNegativo(saldoAcumulado)}
              </td>
              {MESES.map((_, i) => (
                <td key={i} className={saldoMes(i) >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                  {formatValorNegativo(saldoMes(i))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}
