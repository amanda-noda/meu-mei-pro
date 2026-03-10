import React, { useState, useEffect } from "react";
import type { AppUser } from "../api/signupSupabase";
import {
  updateUserProfile,
  updatePassword,
  upsertMeiProfile,
  getMeiProfile,
  DAS_MEI_2025,
  type MeiProfile,
  type DasInfo,
} from "../api/dashboard";

interface DashboardConfiguracoesProps {
  user: AppUser;
  onProfileUpdate?: (user: AppUser) => void;
}

const ATIVIDADES: MeiProfile["atividade"][] = ["servicos", "comercio", "ambos", "transportador"];

export const DashboardConfiguracoes: React.FC<DashboardConfiguracoesProps> = ({
  user,
  onProfileUpdate,
}) => {
  const [nome, setNome] = useState(user.nome);
  const [atividade, setAtividade] = useState<MeiProfile["atividade"]>("servicos");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setNome(user.nome);
  }, [user.nome]);

  useEffect(() => {
    let cancelled = false;
    getMeiProfile(user.id)
      .then((p) => {
        if (!cancelled && p) setAtividade(p.atividade);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user.id]);

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const r = await updateUserProfile(nome);
      if (r.ok) {
        if (r.user) onProfileUpdate?.(r.user);
        setMessage({ type: "ok", text: r.message });
      } else {
        setMessage({ type: "error", text: r.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (novaSenha !== confirmaSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setSaving(true);
    try {
      const r = await updatePassword(novaSenha);
      if (r.ok) {
        setMessage({ type: "ok", text: r.message });
        setNovaSenha("");
        setConfirmaSenha("");
      } else {
        setMessage({ type: "error", text: r.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarMei = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const r = await upsertMeiProfile(user.id, atividade);
      if (r.ok) {
        setMessage({ type: "ok", text: r.message });
      } else {
        setMessage({ type: "error", text: r.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const dasValor = DAS_MEI_2025[atividade]?.valor ?? DAS_MEI_2025.servicos.valor;

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section-title">Configurações</h2>

      {message && (
        <div
          className={`settings-message ${message.type === "ok" ? "settings-message-ok" : "settings-message-error"}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Perfil */}
        <div className="settings-card">
          <h3 className="settings-card-title">Perfil</h3>
          <form onSubmit={handleSalvarPerfil} className="settings-form">
            <label>
              <span>Nome</span>
              <input
                type="text"
                className="pricing-input modal-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                disabled={saving}
              />
            </label>
            <label>
              <span>E-mail</span>
              <input
                type="email"
                className="pricing-input modal-input"
                value={user.email}
                disabled
                title="Alteração de e-mail em breve"
              />
              <span className="settings-hint">E-mail não pode ser alterado por enquanto.</span>
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </div>

        {/* Segurança */}
        <div className="settings-card">
          <h3 className="settings-card-title">Segurança</h3>
          <form onSubmit={handleAlterarSenha} className="settings-form">
            <label>
              <span>Nova senha</span>
              <input
                type="password"
                className="pricing-input modal-input"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                disabled={saving}
              />
            </label>
            <label>
              <span>Confirmar nova senha</span>
              <input
                type="password"
                className="pricing-input modal-input"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Repita a senha"
                disabled={saving}
              />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        </div>

        {/* MEI — Atividade para DAS */}
        <div className="settings-card settings-card-wide das-activity-card">
          <h3 className="settings-card-title">MEI — Atividade para DAS</h3>
          <p className="settings-card-desc">
            O DAS (Documento de Arrecadação do Simples Nacional) é a guia mensal do MEI. O valor varia conforme sua atividade principal. Selecione a que melhor descreve seu negócio.
          </p>

          <div className="das-activity-grid">
            {ATIVIDADES.map((key) => {
              const info = DAS_MEI_2025[key];
              if (!info) return null;
              const isSelected = atividade === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`das-activity-option ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setAtividade(key)}
                  disabled={saving || loading}
                >
                  <span className="das-activity-label">{info.label}</span>
                  <span className="das-activity-valor">
                    R$ {info.valor.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="das-activity-mes">/mês</span>
                </button>
              );
            })}
          </div>

          {atividade && DAS_MEI_2025[atividade] && (
            <div className="das-detail">
              <h4 className="das-detail-title">Composição do DAS selecionado</h4>
              <table className="das-composicao-table">
                <tbody>
                  {(DAS_MEI_2025[atividade] as DasInfo).composicao.map((c, i) => (
                    <tr key={i}>
                      <td>{c.item}</td>
                      <td className="num">R$ {c.valor.toFixed(2).replace(".", ",")}</td>
                    </tr>
                  ))}
                  <tr className="das-total">
                    <td>Total mensal</td>
                    <td className="num">R$ {dasValor.toFixed(2).replace(".", ",")}</td>
                  </tr>
                </tbody>
              </table>
              <p className="das-exemplos">
                <strong>Exemplos:</strong> {(DAS_MEI_2025[atividade] as DasInfo).exemplos}
              </p>
              <p className="das-vencimento">
                Vencimento: todo dia <strong>20</strong> de cada mês. Gere o DAS no{" "}
                <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/simples-nacional" target="_blank" rel="noopener noreferrer">
                  Portal do Simples Nacional
                </a>.
              </p>
            </div>
          )}

          <form onSubmit={handleSalvarMei} className="settings-form das-save-form">
            <button type="submit" className="btn btn-primary" disabled={saving || loading}>
              {saving ? "Salvando..." : "Salvar minha atividade"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
