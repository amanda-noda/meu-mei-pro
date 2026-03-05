import { useState } from 'react'
import type { Lancamento as LancamentoType, TipoLancamento, StatusPagamento } from '../data/constants'
import { MESES, TODAS_CONTAS } from '../data/constants'
import './Lancamentos.css'

interface LancamentosProps {
  lancamentos: LancamentoType[]
  onUpdate: (next: LancamentoType[]) => void
}

function formatDate(s: string) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('pt-BR')
}

function formatValor(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function Lancamentos({ lancamentos, onUpdate }: LancamentosProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Partial<LancamentoType>>({
    dataPagamento: new Date().toISOString().slice(0, 10),
    mes: new Date().getMonth(),
    tipo: 'D',
    planoContas: 'Aluguel',
    descricao: '',
    valor: 0,
    status: 'PAGO',
  })

  const handleSave = (item: LancamentoType) => {
    onUpdate(
      lancamentos.map((l) => (l.id === item.id ? item : l))
    )
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!newRow.descricao?.trim()) return
    const id = crypto.randomUUID()
    onUpdate([
      ...lancamentos,
      {
        id,
        dataPagamento: newRow.dataPagamento || new Date().toISOString().slice(0, 10),
        mes: newRow.mes ?? new Date().getMonth(),
        tipo: (newRow.tipo as TipoLancamento) || 'D',
        planoContas: newRow.planoContas || 'Aluguel',
        descricao: newRow.descricao.trim(),
        valor: Number(newRow.valor) || 0,
        status: (newRow.status as StatusPagamento) || 'PAGO',
      },
    ])
    setNewRow({
      dataPagamento: new Date().toISOString().slice(0, 10),
      mes: new Date().getMonth(),
      tipo: 'D',
      planoContas: 'Aluguel',
      descricao: '',
      valor: 0,
      status: 'PAGO',
    })
  }

  const handleDelete = (id: string) => {
    onUpdate(lancamentos.filter((l) => l.id !== id))
    setEditingId(null)
  }

  return (
    <main className="lancamentos-page">
      <div className="table-scroll-hint" aria-hidden>Deslize para ver mais colunas →</div>
      <div className="table-wrap">
        <table className="lancamentos-table">
          <colgroup>
            <col className="col-data" />
            <col className="col-mes" />
            <col className="col-tipo" />
            <col className="col-plano" />
            <col className="col-descricao" />
            <col className="col-valor" />
            <col className="col-status" />
            <col className="col-acoes" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Mês</th>
              <th scope="col">Tipo</th>
              <th scope="col">Plano de Contas</th>
              <th scope="col">Descrição</th>
              <th scope="col">Valor</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l, i) => (
              <tr key={l.id} className={i % 2 === 1 ? 'row-alt' : ''}>
                {editingId === l.id ? (
                  <EditRow
                    item={l}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(l.id)}
                  />
                ) : (
                  <>
                    <td data-label="Data">{formatDate(l.dataPagamento)}</td>
                    <td data-label="Mês">{MESES[l.mes]}</td>
                    <td data-label="Tipo">
                      <span className={`tipo-badge tipo-${l.tipo}`}>{l.tipo}</span>
                    </td>
                    <td data-label="Plano de Contas">{l.planoContas}</td>
                    <td data-label="Descrição" className="td-descricao">{l.descricao}</td>
                    <td data-label="Valor" className="valor">{formatValor(l.valor)}</td>
                    <td data-label="Status">
                      <span className={`status-badge status-${l.status}`}>{l.status}</span>
                    </td>
                    <td data-label="Ações">
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => setEditingId(l.id)}
                      >
                        Editar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            <tr className="new-row">
              <td data-label="Data">
                <input
                  type="date"
                  value={newRow.dataPagamento || ''}
                  onChange={(e) => setNewRow({ ...newRow, dataPagamento: e.target.value })}
                />
              </td>
              <td data-label="Mês">
                <select
                  value={newRow.mes ?? 0}
                  onChange={(e) => setNewRow({ ...newRow, mes: Number(e.target.value) })}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
              </td>
              <td data-label="Tipo">
                <select
                  value={newRow.tipo || 'D'}
                  onChange={(e) => setNewRow({ ...newRow, tipo: e.target.value as TipoLancamento })}
                >
                  <option value="R">R</option>
                  <option value="D">D</option>
                </select>
              </td>
              <td data-label="Plano de Contas">
                <select
                  value={newRow.planoContas || ''}
                  onChange={(e) => setNewRow({ ...newRow, planoContas: e.target.value })}
                >
                  {TODAS_CONTAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </td>
              <td data-label="Descrição">
                <input
                  type="text"
                  placeholder="Descrição"
                  value={newRow.descricao || ''}
                  onChange={(e) => setNewRow({ ...newRow, descricao: e.target.value })}
                />
              </td>
              <td data-label="Valor">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newRow.valor ?? ''}
                  onChange={(e) => setNewRow({ ...newRow, valor: parseFloat(e.target.value) || 0 })}
                />
              </td>
              <td data-label="Status">
                <select
                  value={newRow.status || 'PAGO'}
                  onChange={(e) => setNewRow({ ...newRow, status: e.target.value as StatusPagamento })}
                >
                  <option value="PAGO">PAGO</option>
                  <option value="PENDENTE">PENDENTE</option>
                </select>
              </td>
              <td data-label="Ações">
                <button type="button" className="btn-add" onClick={handleAdd}>
                  Adicionar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}

function EditRow({
  item,
  onSave,
  onCancel,
  onDelete,
}: {
  item: LancamentoType
  onSave: (item: LancamentoType) => void
  onCancel: () => void
  onDelete: () => void
}) {
  const [edit, setEdit] = useState(item)

  return (
    <>
      <td data-label="Data">
        <input
          type="date"
          value={edit.dataPagamento.slice(0, 10)}
          onChange={(e) => setEdit({ ...edit, dataPagamento: e.target.value })}
        />
      </td>
      <td data-label="Mês">
        <select
          value={edit.mes}
          onChange={(e) => setEdit({ ...edit, mes: Number(e.target.value) })}
        >
          {MESES.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
      </td>
      <td data-label="Tipo">
        <select
          value={edit.tipo}
          onChange={(e) => setEdit({ ...edit, tipo: e.target.value as TipoLancamento })}
        >
          <option value="R">R</option>
          <option value="D">D</option>
        </select>
      </td>
      <td data-label="Plano de Contas">
        <select
          value={edit.planoContas}
          onChange={(e) => setEdit({ ...edit, planoContas: e.target.value })}
        >
          {TODAS_CONTAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </td>
      <td data-label="Descrição">
        <input
          type="text"
          value={edit.descricao}
          onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
        />
      </td>
      <td data-label="Valor">
        <input
          type="number"
          step="0.01"
          value={edit.valor}
          onChange={(e) => setEdit({ ...edit, valor: parseFloat(e.target.value) || 0 })}
        />
      </td>
      <td data-label="Status">
        <select
          value={edit.status}
          onChange={(e) => setEdit({ ...edit, status: e.target.value as StatusPagamento })}
        >
          <option value="PAGO">PAGO</option>
          <option value="PENDENTE">PENDENTE</option>
        </select>
      </td>
      <td data-label="Ações" className="td-acoes">
        <button type="button" className="btn-save" onClick={() => onSave(edit)}>Salvar</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn-delete" onClick={onDelete}>Excluir</button>
      </td>
    </>
  )
}
