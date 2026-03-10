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
import { DashboardConfiguracoes } from "./DashboardConfiguracoes";

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

function formatDataBr(data: string): string {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return data;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function saudacaoPorHorario(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

interface DashboardProps {
  user: AppUser;
  onLogout: () => void;
  onProfileUpdate?: (user: AppUser) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onProfileUpdate }) => {
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
              <span className="header-user-avatar" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div className="header-user-info">
                <span className="header-greeting">{saudacaoPorHorario()},</span>
                <span className="header-user-name">{user.nome}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm header-logout"
                onClick={onLogout}
                title="Sair da conta"
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
            <div className="dashboard-welcome-card">
              <div className="dashboard-welcome-glow" />
              <div className="dashboard-welcome-content">
                <span className="dashboard-welcome-saudacao">{saudacaoPorHorario()},</span>
                <h1 className="dashboard-welcome-nome">{user.nome}</h1>
                <p className="dashboard-subtitle">
                  Visão geral do seu negócio: faturamento, DAS e notas fiscais em um só lugar.
                </p>
                <div className="dashboard-welcome-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Resumo do mês</span>
                </div>
              </div>
            </div>
          </section>

          {activeSection === "resumo" && (
          <>
          <div className="dashboard-resumo-block">
          <section className="dashboard-cards" id="resumo">
            <article className="dashboard-card dashboard-card-hero">
              <div className="dashboard-card-accent dashboard-card-accent-pink" />
              <div className="dashboard-card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="dashboard-card-body">
                <span className="pill pill-green">Em dia</span>
                <h3>Faturamento do mês</h3>
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
                  className="btn btn-primary btn-sm dashboard-card-btn"
                  onClick={() => setShowAddReceita(true)}
                >
                  + Adicionar receita
                </button>
              </div>
            </article>

            <article className="dashboard-card dashboard-card-das">
              <div className="dashboard-card-accent dashboard-card-accent-purple" />
              <div className="dashboard-card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="dashboard-card-body">
                <span className={`pill ${dasInfo?.status === "Vencido" ? "pill-pending" : "pill-green"}`}>
                  {dasInfo?.status ?? "Próximo"}
                </span>
                <h3>DAS e obrigações</h3>
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
            </article>

            <article className="dashboard-card dashboard-card-notas">
              <div className="dashboard-card-accent dashboard-card-accent-amber" />
              <div className="dashboard-card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="dashboard-card-body">
                <span className="pill pill-emitidas">Emitidas</span>
                <h3>Notas fiscais</h3>
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
                  className="btn btn-primary btn-sm dashboard-card-btn"
                  onClick={() => setShowAddNota(true)}
                >
                  + Registrar nota
                </button>
              </div>
            </article>
          </section>

          {notas.length > 0 && (
            <section className="dashboard-notas">
              <div className="dashboard-notas-header">
                <span className="dashboard-notas-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <h2>Últimas notas emitidas</h2>
                <p className="dashboard-notas-sub">Suas notas mais recentes</p>
              </div>
              <div className="dashboard-notas-grid">
                {notas.slice(0, 5).map((n) => (
                  <article key={n.id} className="dashboard-nota-card">
                    <div className="dashboard-nota-card-accent" />
                    <div className="dashboard-nota-card-body">
                      <span className="dashboard-nota-tipo">{n.tipo || "NFC-e"}</span>
                      <h4 className="dashboard-nota-numero">{n.numero || "—"}</h4>
                      <p className="dashboard-nota-desc">{n.descricao || "Sem descrição"}</p>
                      <div className="dashboard-nota-footer">
                        <span className="dashboard-nota-data">{formatDataBr(n.data_emissao)}</span>
                        <span className="dashboard-nota-valor">{formatBrl(n.valor)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-actions">
            <div className="dashboard-actions-header">
              <span className="dashboard-actions-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
              <div>
                <h2 className="dashboard-actions-title">Acesso rápido</h2>
                <p className="dashboard-actions-sub">Atalhos para as principais funções</p>
              </div>
            </div>
            <div className="dashboard-actions-grid">
              <button
                type="button"
                className="dashboard-action-card dashboard-action-card-1"
                onClick={() => setActiveSection("financeiro")}
              >
                <span className="dashboard-action-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 14v4" />
                    <path d="M12 10v8" />
                    <path d="M17 6v12" />
                  </svg>
                </span>
                <span className="dashboard-action-label">Painel Financeiro</span>
                <span className="dashboard-action-hint">Receitas e despesas</span>
                <span className="dashboard-action-arrow" aria-hidden>→</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card dashboard-action-card-2"
                onClick={() => setActiveSection("precificacao")}
              >
                <span className="dashboard-action-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <span className="dashboard-action-label">Precificação</span>
                <span className="dashboard-action-hint">Calcule seus preços</span>
                <span className="dashboard-action-arrow" aria-hidden>→</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card dashboard-action-card-3"
                onClick={() => setActiveSection("financeiro")}
              >
                <span className="dashboard-action-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="dashboard-action-label">Lançamentos</span>
                <span className="dashboard-action-hint">Registre entradas e saídas</span>
                <span className="dashboard-action-arrow" aria-hidden>→</span>
              </button>
              <button
                type="button"
                className="dashboard-action-card dashboard-action-card-4"
                onClick={() => setActiveSection("configuracoes")}
              >
                <span className="dashboard-action-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span className="dashboard-action-label">Configurações</span>
                <span className="dashboard-action-hint">Perfil e preferências</span>
                <span className="dashboard-action-arrow" aria-hidden>→</span>
              </button>
            </div>
          </section>
          </div>
          </>
          )}

          {activeSection === "financeiro" && (
            <DashboardFinanceiro userId={user.id} />
          )}

          {activeSection === "precificacao" && (
            <DashboardPrecificacao />
          )}

          {activeSection === "configuracoes" && (
            <DashboardConfiguracoes user={user} onProfileUpdate={onProfileUpdate} />
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
