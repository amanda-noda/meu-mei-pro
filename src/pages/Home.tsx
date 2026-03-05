interface HomeProps {
  onLancamentos: () => void
  onPainel: () => void
  onCadastro: () => void
}

export function Home({ onLancamentos, onPainel, onCadastro }: HomeProps) {
  return (
    <main className="home">
      <div className="home-decor" aria-hidden>
        <span className="home-orb home-orb-1" />
        <span className="home-orb home-orb-2" />
        <span className="home-orb home-orb-3" />
      </div>
      <div className="home-marca" aria-label="MEU MEI PRO">
        MEU MEI PRO
      </div>
      <div className="home-hero">
        <h1>CONTROLE FINANCEIRO</h1>
        <p className="home-hero-sub">Gerencie suas receitas e despesas do MEI de forma simples e intuitiva.</p>
      </div>
      <div className="home-divider" aria-hidden />
      <div className="home-buttons">
        <button type="button" className="home-btn" onClick={onLancamentos}>
          <span className="home-btn-icon">📋</span>
          LANÇAMENTOS
        </button>
        <button type="button" className="home-btn" onClick={onPainel}>
          <span className="home-btn-icon">📊</span>
          PAINEL FINANÇAS
        </button>
        <button type="button" className="home-btn" onClick={onCadastro}>
          <span className="home-btn-icon">✏️</span>
          CADASTRO RECEITAS E DESPESAS
        </button>
      </div>
    </main>
  )
}
