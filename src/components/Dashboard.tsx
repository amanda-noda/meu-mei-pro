import React, { useState, useEffect, useCallback } from "react";
import type { AppUser } from "../api/signupSupabase";
import {
  getFaturamentoMes,
  getDasInfo,
  getNotasFiscais,
  addLancamento,
  addNotaFiscal,
  DAS_MEI_2025,
  type NotaFiscal,
} from "../api/dashboard";
import { DashboardFinanceiro } from "./DashboardFinanceiro";
import { DashboardPrecificacao } from "./DashboardPrecificacao";

export type DashboardSection = "resumo" | "financeiro" | "precificacao" | "configuracoes";

function formatBrl(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function mesAtual(): string {
  const m = new Date().getMonth();
  const nomes = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return nomes[m];
}

interface DashboardProps {
  user: AppUser;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>("resumo");
  const [faturamento, setFaturamento] = useState<number>(0);
  const [dasInfo, setDasInfo] = useState<{ valor: number; label: string; vencimento: string; status: string; obrigacoes: { id: string; nome: string; periodicidade: string; vencimento: string }[] } | null>(null);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReceita, setShowAddReceita] = useState(false);
  const [showAddNota, setShowAddNota] = useState(false);
  const [receitaForm, setReceitaForm] = useState({ descricao: "", valor: 0, planoContas: "Receita" });
  const [notaForm, setNotaForm] = useState({ numero: "", valor: 0, descricao: "" });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fat, das, nf] = await Promise.all([
        getFaturamentoMes(user.id),
        getDasInfo(user.id),
        getNotasFiscais(user.id),
      ]);
      setFaturamento(fat);
      setDasInfo(das);
      setNotas(nf);
    } catch (e) {
      console.warn("Erro ao carregar dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddReceita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (receitaForm.valor <= 0) return;
    setSaving(true);
    try {
      await addLancamento(user.id, {
        data_pagamento: new Date().toLocaleDateString("pt-BR"),
        mes: mesAtual(),
        tipo: "R",
        plano_contas: receitaForm.planoContas,
        descricao: receitaForm.descricao,
        valor: receitaForm.valor,
        status: "PAGO",
      });
      setReceitaForm({ descricao: "", valor: 0, planoContas: "Receita" });
      setShowAddReceita(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notaForm.valor <= 0) return;
    setSaving(true);
    try {
      await addNotaFiscal(user.id, {
        numero: notaForm.numero,
        valor: notaForm.valor,
        descricao: notaForm.descricao,
        data_emissao: new Date().toISOString().slice(0, 10),
      });
      setNotaForm({ numero: "", valor: 0, descricao: "" });
      setShowAddNota(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const totalNotas = notas.reduce((s, n) => s + n.valor, 0);

  return (
    <div className="page dashboard-page">
      <header className="site-header">
        <div className="shell">
          <div className="site-header-inner">
            <a href="/" className="brand">
              <img
                src="/logo-meu-mei-pro.png"
                alt="Meu MEI Pro"
                className="brand-logo"
              />
            </a>
            <nav className="dashboard-nav">
              <button
                type="button"
                className={`nav-link ${activeSection === "resumo" ? "active" : ""}`}
                onClick={() => setActiveSection("resumo")}
              >
                Resumo
              </button>
              <button
                type="button"
                className={`nav-link ${activeSection === "financeiro" ? "active" : ""}`}
                onClick={() => setActiveSection("financeiro")}
              >
                Financeiro
              </button>
              <button
                type="button"
                className={`nav-link ${activeSection === "precificacao" ? "active" : ""}`}
                onClick={() => setActiveSection("precificacao")}
              >
                Precificação
              </button>
              <button
                type="button"
                className={`nav-link ${activeSection === "configuracoes" ? "active" : ""}`}
                onClick={() => setActiveSection("configuracoes")}
              >
                Configurações
              </button>
            </nav>
            <div className="header-user">
              <span className="header-greeting">Olá, {user.nome}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm header-logout"
                onClick={onLogout}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="shell">
          <section className="dashboard-welcome">
            <h1>Bem-vindo(a), {user.nome}</h1>
            <p className="dashboard-subtitle">
              Acompanhe o resumo do seu MEI: faturamento, DAS e notas fiscais.
            </p>
          </section>

          {activeSection === "resumo" && (
          <>
          <section className="dashboard-cards" id="resumo">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <span className="pill pill-green">Em dia</span>
                <h3>Faturamento do mês</h3>
              </div>
              {loading ? (
                <p className="dashboard-card-value">...</p>
              ) : (
                <p className="dashboard-card-value">{formatBrl(faturamento)}</p>
              )}
              <p className="dashboard-card-meta">
                Receitas em {mesAtual()}. Adicione lançamentos para atualizar.
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm dashboard-card-btn"
                onClick={() => setShowAddReceita(true)}
              >
                + Adicionar receita
              </button>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <span className={`pill ${dasInfo?.status === "Vencido" ? "pill-pending" : "pill-green"}`}>
                  {dasInfo?.status ?? "Próximo"}
                </span>
                <h3>DAS e obrigações</h3>
              </div>
              {loading ? (
                <p className="dashboard-card-value">...</p>
              ) : dasInfo ? (
                <>
                  <p className="dashboard-card-value">{formatBrl(dasInfo.valor)}</p>
                  <p className="dashboard-card-meta">
                    {dasInfo.label} — Vencimento: {dasInfo.vencimento} de cada mês
                  </p>
                  <details className="dashboard-details">
                    <summary>Ver obrigações</summary>
                    <ul className="dashboard-obrigacoes">
                      {dasInfo.obrigacoes.map((o) => (
                        <li key={o.id}>
                          <strong>{o.nome}</strong>: {o.periodicidade} — {o.vencimento}
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              ) : (
                <>
                  <p className="dashboard-card-value">{formatBrl(DAS_MEI_2025.servicos.valor)}</p>
                  <p className="dashboard-card-meta">Prestação de Serviços (padrão). Configure em Configurações.</p>
                </>
              )}
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <span className="pill pill-soft">Emitidas</span>
                <h3>Notas fiscais</h3>
              </div>
              {loading ? (
                <p className="dashboard-card-value">...</p>
              ) : (
                <p className="dashboard-card-value">{notas.length}</p>
              )}
              <p className="dashboard-card-meta">
                Total: {formatBrl(totalNotas)} em {notas.length} nota(s)
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm dashboard-card-btn"
                onClick={() => setShowAddNota(true)}
              >
                + Registrar nota
              </button>
            </div>
          </section>

          {notas.length > 0 && (
            <section className="dashboard-notas">
              <h2>Últimas notas emitidas</h2>
              <div className="dashboard-notas-list">
                {notas.slice(0, 5).map((n) => (
                  <div key={n.id} className="dashboard-nota-item">
                    <span>{n.numero || "—"}</span>
                    <span>{n.descricao || "Sem descrição"}</span>
                    <span className="num">{formatBrl(n.valor)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-actions">
            <h2>Acesso rápido</h2>
            <div className="dashboard-actions-grid">
              <button
                type="button"
                className="dashboard-action-card"
                onClick={() => setActiveSection("financeiro")}
              >
                <span className="dashboard-action-icon">📊</span>
                <span>Painel Financeiro</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card"
                onClick={() => setActiveSection("precificacao")}
              >
                <span className="dashboard-action-icon">💰</span>
                <span>Precificação</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card"
                onClick={() => setActiveSection("financeiro")}
              >
                <span className="dashboard-action-icon">📝</span>
                <span>Lançamentos</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card"
                onClick={() => setActiveSection("configuracoes")}
              >
                <span className="dashboard-action-icon">⚙️</span>
                <span>Configurações</span>
              </button>
            </div>
          </section>
          </>
          )}

          {activeSection === "financeiro" && (
            <DashboardFinanceiro userId={user.id} />
          )}

          {activeSection === "precificacao" && (
            <DashboardPrecificacao />
          )}

          {activeSection === "configuracoes" && (
            <section className="dashboard-section">
              <h2 className="dashboard-section-title">Configurações</h2>
              <p className="pricing-meta">Em breve: configurações do MEI.</p>
            </section>
          )}
        </div>
      </main>

      {/* Modal Adicionar receita */}
      {showAddReceita && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddReceita(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar receita</h3>
            <form onSubmit={handleAddReceita}>
              <label>
                <span>Descrição</span>
                <input
                  type="text"
                  className="pricing-input modal-input"
                  placeholder="Ex: Venda de produtos"
                  value={receitaForm.descricao}
                  onChange={(e) => setReceitaForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </label>
              <label>
                <span>Valor (R$)</span>
                <input
                  type="number"
                  className="pricing-input modal-input"
                  step={0.01}
                  min={0}
                  value={receitaForm.valor || ""}
                  onChange={(e) => setReceitaForm((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </label>
              <label>
                <span>Plano de contas</span>
                <input
                  type="text"
                  className="pricing-input modal-input"
                  placeholder="Ex: Receita Produtos"
                  value={receitaForm.planoContas}
                  onChange={(e) => setReceitaForm((f) => ({ ...f, planoContas: e.target.value }))}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddReceita(false)} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar nota fiscal */}
      {showAddNota && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddNota(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Registrar nota fiscal</h3>
            <form onSubmit={handleAddNota}>
              <label>
                <span>Número</span>
                <input
                  type="text"
                  className="pricing-input modal-input"
                  placeholder="Ex: 123456"
                  value={notaForm.numero}
                  onChange={(e) => setNotaForm((f) => ({ ...f, numero: e.target.value }))}
                />
              </label>
              <label>
                <span>Valor (R$)</span>
                <input
                  type="number"
                  className="pricing-input modal-input"
                  step={0.01}
                  min={0}
                  value={notaForm.valor || ""}
                  onChange={(e) => setNotaForm((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </label>
              <label>
                <span>Descrição</span>
                <input
                  type="text"
                  className="pricing-input modal-input"
                  placeholder="Ex: Venda de produtos"
                  value={notaForm.descricao}
                  onChange={(e) => setNotaForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddNota(false)} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
