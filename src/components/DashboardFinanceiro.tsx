import React, { useState, useEffect, useCallback } from "react";
import {
  getLancamentos,
  addLancamento,
  updateLancamento,
  deleteLancamento,
  type Lancamento,
} from "../api/dashboard";

const MESES_ORDEM: Record<string, number> = {
  janeiro: 1, jan: 1, "1": 1, "01": 1,
  fevereiro: 2, fev: 2, "2": 2, "02": 2,
  março: 3, marco: 3, mar: 3, "3": 3, "03": 3,
  abril: 4, abr: 4, "4": 4, "04": 4,
  maio: 5, mai: 5, "5": 5, "05": 5,
  junho: 6, jun: 6, "6": 6, "06": 6,
  julho: 7, jul: 7, "7": 7, "07": 7,
  agosto: 8, ago: 8, "8": 8, "08": 8,
  setembro: 9, set: 9, "9": 9, "09": 9,
  outubro: 10, out: 10, "10": 10,
  novembro: 11, nov: 11, "11": 11,
  dezembro: 12, dez: 12, "12": 12,
};

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function normalizarMes(mes: string): number {
  const m = mes?.toLowerCase().trim();
  return MESES_ORDEM[m ?? ""] ?? 0;
}

function formatBrl(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "0,00";
}

interface DashboardFinanceiroProps {
  userId: string;
}

function agregarPorPlanoContasMes(lancamentos: Lancamento[]): {
  receitas: Record<string, number[]>;
  despesas: Record<string, number[]>;
  receitaTotalMes: number[];
  despesaTotalMes: number[];
  totalReceita: number;
  totalDespesas: number;
  saldo: number;
} {
  const receitas: Record<string, number[]> = {};
  const despesas: Record<string, number[]> = {};
  const receitaTotalMes = Array(12).fill(0);
  const despesaTotalMes = Array(12).fill(0);

  for (const l of lancamentos) {
    const mesIdx = normalizarMes(l.mes) - 1;
    if (mesIdx < 0 || mesIdx >= 12) continue;

    const conta = l.plano_contas?.trim() || "(sem conta)";
    const valor = Number(l.valor) || 0;

    if (l.tipo === "R") {
      if (!receitas[conta]) receitas[conta] = Array(12).fill(0);
      receitas[conta][mesIdx] += valor;
      receitaTotalMes[mesIdx] += valor;
    } else {
      if (!despesas[conta]) despesas[conta] = Array(12).fill(0);
      despesas[conta][mesIdx] += valor;
      despesaTotalMes[mesIdx] += valor;
    }
  }

  const totalReceita = receitaTotalMes.reduce((a, b) => a + b, 0);
  const totalDespesas = despesaTotalMes.reduce((a, b) => a + b, 0);
  const saldo = totalReceita - totalDespesas;

  return {
    receitas,
    despesas,
    receitaTotalMes,
    despesaTotalMes,
    totalReceita,
    totalDespesas,
    saldo,
  };
}

export const DashboardFinanceiro: React.FC<DashboardFinanceiroProps> = ({ userId }) => {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLancamentos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLancamentos(userId);
      setLancamentos(data);
    } catch (e) {
      console.warn("Erro ao carregar lançamentos:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLancamentos();
  }, [loadLancamentos]);

  const painel = agregarPorPlanoContasMes(lancamentos);

  const handleAddLancamento = async () => {
    setSaving(true);
    try {
      const novo = await addLancamento(userId, {
        data_pagamento: new Date().toLocaleDateString("pt-BR"),
        mes: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][new Date().getMonth()],
        tipo: "R",
        plano_contas: "",
        descricao: "",
        valor: 0,
        status: "PENDENTE",
      });
      if (novo) await loadLancamentos();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLancamento = (
    id: string,
    field: keyof Omit<Lancamento, "id" | "user_id">
  ) => {
    return (value: string | number) => {
      const updates: Record<string, string | number> = {};
      if (field === "data_pagamento") updates.data_pagamento = String(value);
      else if (field === "mes") updates.mes = String(value);
      else if (field === "tipo") updates.tipo = value as "R" | "D";
      else if (field === "plano_contas") updates.plano_contas = String(value);
      else if (field === "descricao") updates.descricao = String(value);
      else if (field === "valor") updates.valor = Number(value) || 0;
      else if (field === "status") updates.status = value as "PAGO" | "PENDENTE";

      setSaving(true);
      updateLancamento(userId, id, updates as Partial<Omit<Lancamento, "id" | "user_id">>)
        .then(() => loadLancamentos())
        .finally(() => setSaving(false));
    };
  };

  const handleDeleteLancamento = async (id: string) => {
    setSaving(true);
    try {
      await deleteLancamento(userId, id);
      await loadLancamentos();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2 className="dashboard-section-title">Controle Financeiro</h2>

      {/* Painel Financeiro - 12 meses derivado dos lançamentos */}
      <div className="pricing-block">
        <h3 className="pricing-block-title">Painel Financeiro</h3>
        <p className="pricing-meta">
          Valores agregados por plano de contas e mês, derivados dos lançamentos.
        </p>
        <div className="pricing-card pricing-card-wide">
          <div className="financial-table-wrap">
            <table className="pricing-table financial-panel-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="num">Acumulado Ano</th>
                  {MESES_ABREV.map((m) => (
                    <th key={m} className="num">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="row-group">
                  <td colSpan={14} className="group-label">
                    RECEITAS
                  </td>
                </tr>
                {Object.entries(painel.receitas).map(([conta, arr]) => {
                  const sum = arr.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={`R-${conta}`}>
                      <td>{conta}</td>
                      <td className="num">
                        {formatBrl(sum)}
                      </td>
                      {arr.map((v, i) => (
                        <td key={i} className="num">
                          {v > 0 ? formatBrl(v) : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {Object.keys(painel.receitas).length === 0 && (
                  <tr>
                    <td colSpan={14} className="muted">
                      Nenhuma receita encontrada. Adicione lançamentos do tipo R.
                    </td>
                  </tr>
                )}
                <tr className="highlight">
                  <td>Receita Total</td>
                  <td className="num positive">{fmt(painel.totalReceita)}</td>
                  {painel.receitaTotalMes.map((v, i) => (
                    <td key={i} className="num positive">
                      {fmt(v)}
                    </td>
                  ))}
                </tr>

                <tr className="row-group">
                  <td colSpan={14} className="group-label">
                    DESPESAS
                  </td>
                </tr>
                {Object.entries(painel.despesas).map(([conta, arr]) => {
                  const sum = arr.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={`D-${conta}`}>
                      <td>{conta}</td>
                      <td className="num negative">({fmt(sum)})</td>
                      {arr.map((v, i) => (
                        <td key={i} className="num negative">
                          {v > 0 ? `(${fmt(v)})` : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {Object.keys(painel.despesas).length === 0 && (
                  <tr>
                    <td colSpan={14} className="muted">
                      Nenhuma despesa encontrada. Adicione lançamentos do tipo D.
                    </td>
                  </tr>
                )}
                <tr className="highlight">
                  <td>Total Despesas</td>
                  <td className="num negative">({fmt(painel.totalDespesas)})</td>
                  {painel.despesaTotalMes.map((v, i) => (
                    <td key={i} className="num negative">
                      ({fmt(v)})
                    </td>
                  ))}
                </tr>

                <tr className="total">
                  <td>Total Receita</td>
                  <td className="num positive">{fmt(painel.totalReceita)}</td>
                  <td colSpan={12}></td>
                </tr>
                <tr className="total">
                  <td>Total Despesas</td>
                  <td className="num negative">({fmt(painel.totalDespesas)})</td>
                  <td colSpan={12}></td>
                </tr>
                <tr className="total highlight">
                  <td>Saldo Acumulado</td>
                  <td
                    className={
                      painel.saldo >= 0 ? "num positive" : "num negative"
                    }
                  >
                    {painel.saldo >= 0
                      ? fmt(painel.saldo)
                      : `(${fmt(-painel.saldo)})`}
                  </td>
                  <td colSpan={12}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lançamentos - CRUD Supabase */}
      <div className="pricing-block">
        <h3 className="pricing-block-title">Lançamentos</h3>
        <div className="pricing-card pricing-card-wide">
          <div className="lancamentos-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddLancamento}
              disabled={saving || loading}
            >
              + Adicionar lançamento
            </button>
          </div>
          {loading ? (
            <p className="pricing-meta">Carregando lançamentos...</p>
          ) : (
            <div className="financial-table-wrap">
              <table className="pricing-table financial-panel-table lancamentos-table">
                <thead>
                  <tr>
                    <th>Data Pagamento</th>
                    <th>Mês</th>
                    <th>Tipo</th>
                    <th>Plano de Contas</th>
                    <th>Descrição</th>
                    <th className="num">Valor (R$)</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l, idx) => (
                    <tr key={l.id} className={idx % 2 === 1 ? "row-alt" : ""}>
                      <td>
                        <input
                          type="text"
                          className="pricing-input pricing-input-inline-cell"
                          placeholder="dd/mm/aaaa"
                          defaultValue={l.data_pagamento}
                          onBlur={(e) =>
                            handleUpdateLancamento(l.id, "data_pagamento")(
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="pricing-input pricing-input-inline-cell"
                          placeholder="mês"
                          defaultValue={l.mes}
                          onBlur={(e) =>
                            handleUpdateLancamento(l.id, "mes")(e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <div className="radio-group-inline">
                          <label
                            className={`radio-option-inline radio-receita ${l.tipo === "R" ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`tipo-${l.id}`}
                              value="R"
                              checked={l.tipo === "R"}
                              onChange={() =>
                                handleUpdateLancamento(l.id, "tipo")("R")
                              }
                            />
                            <span className="radio-dot" /> R
                          </label>
                          <label
                            className={`radio-option-inline radio-despesa ${l.tipo === "D" ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`tipo-${l.id}`}
                              value="D"
                              checked={l.tipo === "D"}
                              onChange={() =>
                                handleUpdateLancamento(l.id, "tipo")("D")
                              }
                            />
                            <span className="radio-dot" /> D
                          </label>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="pricing-input pricing-input-inline-cell"
                          placeholder="Conta"
                          defaultValue={l.plano_contas}
                          onBlur={(e) =>
                            handleUpdateLancamento(l.id, "plano_contas")(
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="pricing-input pricing-input-inline-cell"
                          placeholder="Descrição"
                          defaultValue={l.descricao}
                          onBlur={(e) =>
                            handleUpdateLancamento(l.id, "descricao")(
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="num">
                        <input
                          type="number"
                          className="pricing-input pricing-input-cell"
                          step={0.01}
                          defaultValue={l.valor}
                          onBlur={(e) =>
                            handleUpdateLancamento(l.id, "valor")(
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td>
                        <div className="radio-group-inline">
                          <label
                            className={`radio-option-inline radio-pago ${l.status === "PAGO" ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`status-${l.id}`}
                              value="PAGO"
                              checked={l.status === "PAGO"}
                              onChange={() =>
                                handleUpdateLancamento(l.id, "status")("PAGO")
                              }
                            />
                            <span className="radio-dot" /> PAGO
                          </label>
                          <label
                            className={`radio-option-inline radio-pendente ${l.status === "PENDENTE" ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`status-${l.id}`}
                              value="PENDENTE"
                              checked={l.status === "PENDENTE"}
                              onChange={() =>
                                handleUpdateLancamento(l.id, "status")(
                                  "PENDENTE"
                                )
                              }
                            />
                            <span className="radio-dot" /> PEND.
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleDeleteLancamento(l.id)}
                          disabled={saving}
                          title="Remover"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && lancamentos.length === 0 && (
            <p className="pricing-meta">Nenhum lançamento. Clique em &quot;Adicionar lançamento&quot; para começar.</p>
          )}
        </div>
      </div>
    </div>
  );
};
