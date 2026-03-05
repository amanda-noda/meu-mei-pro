import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Lancamento as LancamentoType, TipoLancamento, StatusPagamento } from '../data/constants'
import { MESES, PLANO_CONTAS } from '../data/constants'
import './CadastroReceitasDespesas.css'

interface CadastroReceitasDespesasProps {
  lancamentos: LancamentoType[]
  onUpdate: (next: LancamentoType[]) => void
}

const TODAS_CONTAS = [
  ...PLANO_CONTAS.receitas,
  ...PLANO_CONTAS.custoVenda,
  ...PLANO_CONTAS.despesasFixas,
  ...PLANO_CONTAS.despesasVariaveis,
  ...PLANO_CONTAS.despesasOutras,
]

export function CadastroReceitasDespesas({ lancamentos, onUpdate }: CadastroReceitasDespesasProps) {
  const hoje = new Date().toISOString().slice(0, 10)
  const [dataPagamento, setDataPagamento] = useState(hoje)
  const [mes, setMes] = useState(new Date().getMonth())
  const [tipo, setTipo] = useState<TipoLancamento>('D')
  const [planoContas, setPlanoContas] = useState('Aluguel')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState<StatusPagamento>('PAGO')
  const [mensagem, setMensagem] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const v = parseFloat(valor.replace(',', '.'))
    if (!descricao.trim()) {
      setMensagem('Preencha a descrição.')
      return
    }
    if (isNaN(v) || v < 0) {
      setMensagem('Informe um valor válido.')
      return
    }
    const novo: LancamentoType = {
      id: crypto.randomUUID(),
      dataPagamento,
      mes,
      tipo,
      planoContas,
      descricao: descricao.trim(),
      valor: v,
      status,
    }
    onUpdate([...lancamentos, novo])
    setDescricao('')
    setValor('')
    setMensagem('Lançamento cadastrado com sucesso!')
    setTimeout(() => setMensagem(''), 3000)
  }

  return (
    <main className="cadastro-page">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <div className="cadastro-grid">
          <section className="cadastro-categorias">
            <h3>Plano de contas</h3>
            <div className="grupo-categoria">
              <h4>RECEITAS</h4>
              <ul>
                {PLANO_CONTAS.receitas.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="grupo-categoria">
              <h4>CUSTO VENDA</h4>
              <ul>
                {PLANO_CONTAS.custoVenda.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="grupo-categoria">
              <h4>DESPESAS FIXAS</h4>
              <ul>
                {PLANO_CONTAS.despesasFixas.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="grupo-categoria">
              <h4>DESPESAS VARIÁVEIS</h4>
              <ul>
                {PLANO_CONTAS.despesasVariaveis.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="grupo-categoria">
              <h4>DESPESAS OUTRAS</h4>
              <ul>
                {PLANO_CONTAS.despesasOutras.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="cadastro-campos">
            <h3>Novo lançamento</h3>

            <div className="campo">
              <label>Tipo</label>
              <div className="tipo-opcoes">
                <label className="opcao">
                  <input
                    type="radio"
                    name="tipo"
                    value="R"
                    checked={tipo === 'R'}
                    onChange={() => setTipo('R')}
                  />
                  <span className="opcao-r">R - RECEITA</span>
                </label>
                <label className="opcao">
                  <input
                    type="radio"
                    name="tipo"
                    value="D"
                    checked={tipo === 'D'}
                    onChange={() => setTipo('D')}
                  />
                  <span className="opcao-d">D - DESPESAS</span>
                </label>
              </div>
            </div>

            <div className="campo">
              <label>Plano de contas</label>
              <select
                value={planoContas}
                onChange={(e) => setPlanoContas(e.target.value)}
              >
                {TODAS_CONTAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Data pagamento</label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Mês</label>
              <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                {MESES.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Descrição</label>
              <input
                type="text"
                placeholder="Ex: Aluguel Loja, Venda Canecas..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Valor (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Status</label>
              <div className="status-opcoes">
                <label className="opcao">
                  <input
                    type="radio"
                    name="status"
                    value="PAGO"
                    checked={status === 'PAGO'}
                    onChange={() => setStatus('PAGO')}
                  />
                  <span className="status-pago">PAGO</span>
                </label>
                <label className="opcao">
                  <input
                    type="radio"
                    name="status"
                    value="PENDENTE"
                    checked={status === 'PENDENTE'}
                    onChange={() => setStatus('PENDENTE')}
                  />
                  <span className="status-pendente">PENDENTE</span>
                </label>
              </div>
            </div>

            {mensagem && (
              <p className={`mensagem ${mensagem.includes('sucesso') ? 'sucesso' : 'erro'}`}>
                {mensagem}
              </p>
            )}

            <button type="submit" className="btn-cadastrar">
              Cadastrar lançamento
            </button>
          </section>
        </div>
      </form>
    </main>
  )
}
