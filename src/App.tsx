import React, { useState, useMemo, useEffect } from "react";
import { signUpWithSupabase, signInWithSupabase, type AppUser } from "./api/signupSupabase";
import { supabase } from "./lib/supabase";

const BENEFITS_USE_LIMIT = 3;
const BENEFITS_STORAGE_KEY = "meu-mei-pro-benefits-uses";

function getStoredBenefitsCount(): number {
  try {
    const v = localStorage.getItem(BENEFITS_STORAGE_KEY);
    const n = parseInt(v ?? "0", 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

function setStoredBenefitsCount(n: number): void {
  try {
    localStorage.setItem(BENEFITS_STORAGE_KEY, String(Math.max(0, n)));
  } catch {}
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

function CadastroGrupo({
  label,
  itens,
  setItens,
  addItem,
  removeItem,
}: {
  label: string;
  itens: string[];
  setItens: React.Dispatch<React.SetStateAction<string[]>>;
  addItem: (setter: React.Dispatch<React.SetStateAction<string[]>>, novo: string) => void;
  removeItem: (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => void;
}) {
  const [novo, setNovo] = useState("");
  return (
    <div className="cadastro-grupo">
      <div className="group-label">{label}</div>
      <ul className="cadastro-list">
        {itens.map((item, index) => (
          <li key={`${label}-${index}`}>
            <span>{item}</span>
            <button type="button" className="btn-remove btn-remove-small" onClick={() => removeItem(setItens, index)} title="Remover">×</button>
          </li>
        ))}
      </ul>
      <div className="cadastro-add">
        <input
          type="text"
          className="pricing-input pricing-input-inline-cell"
          placeholder={`Novo item em ${label}`}
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { addItem(setItens, novo); setNovo(""); } }}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { addItem(setItens, novo); setNovo(""); }}>
          Adicionar
        </button>
      </div>
    </div>
  );
}

export const App: React.FC = () => {
  /* --- Precificação de Produtos --- */
  const [custoProduto, setCustoProduto] = useState(20);
  const [markupDesejado, setMarkupDesejado] = useState(3);
  const [impostosPct, setImpostosPct] = useState(5);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState(4);
  const [comissaoPlataformasPct, setComissaoPlataformasPct] = useState(3);
  const [comissaoVendedoresPct, setComissaoVendedoresPct] = useState(2);
  const [marketingPct, setMarketingPct] = useState(2);
  const [outrosPct, setOutrosPct] = useState(2);
  const [freteGratisRs, setFreteGratisRs] = useState(3);
  const [embalagemRs, setEmbalagemRs] = useState(3);
  const [outrosRs, setOutrosRs] = useState(3);

  const precoCalculado = useMemo(
    () => custoProduto * markupDesejado,
    [custoProduto, markupDesejado]
  );
  const lucroBruto = useMemo(
    () => precoCalculado - custoProduto,
    [precoCalculado, custoProduto]
  );
  const markupPct = useMemo(
    () => (markupDesejado > 0 ? (markupDesejado - 1) * 100 : 0),
    [markupDesejado]
  );

  const deducoesProduto = useMemo(() => {
    const impostosVal = (precoCalculado * impostosPct) / 100;
    const taxaCartaoVal = (precoCalculado * taxaCartaoPct) / 100;
    const comissaoPlatVal = (precoCalculado * comissaoPlataformasPct) / 100;
    const comissaoVendVal = (precoCalculado * comissaoVendedoresPct) / 100;
    const marketingVal = (precoCalculado * marketingPct) / 100;
    const outrosPctVal = (precoCalculado * outrosPct) / 100;
    const total =
      impostosVal +
      taxaCartaoVal +
      comissaoPlatVal +
      comissaoVendVal +
      marketingVal +
      outrosPctVal +
      freteGratisRs +
      embalagemRs +
      outrosRs;
    const margemContrib = precoCalculado - total;
    const totalPct = precoCalculado > 0 ? (total / precoCalculado) * 100 : 0;
    const margemPct = precoCalculado > 0 ? (margemContrib / precoCalculado) * 100 : 0;
    return {
      impostosVal,
      taxaCartaoVal,
      comissaoPlatVal,
      comissaoVendVal,
      marketingVal,
      outrosPctVal,
      total,
      margemContrib,
      totalPct,
      margemPct,
    };
  }, [
    precoCalculado,
    impostosPct,
    taxaCartaoPct,
    comissaoPlataformasPct,
    comissaoVendedoresPct,
    marketingPct,
    outrosPct,
    freteGratisRs,
    embalagemRs,
    outrosRs,
  ]);

  /* --- Precificação de Serviços --- */
  const [horasUteisDia, setHorasUteisDia] = useState(8);
  const [minutosPorServico, setMinutosPorServico] = useState(40);
  const [diasUteisMes, setDiasUteisMes] = useState(30);
  const [quantidadeServicosEfetivos, setQuantidadeServicosEfetivos] = useState(40);
  const [aluguel, setAluguel] = useState(800);
  const [impostosServ, setImpostosServ] = useState(78);
  const [contador, setContador] = useState(200);
  const [insumos, setInsumos] = useState(300);
  const [midia, setMidia] = useState(400);
  const [telefonia, setTelefonia] = useState(200);
  const [mobilidade, setMobilidade] = useState(350);
  const [salarios, setSalarios] = useState(0);
  const [outrosCustos, setOutrosCustos] = useState(0);
  const [ganhosLiquidosPretendidos, setGanhosLiquidosPretendidos] = useState(3000);

  const capacidadeServicos = useMemo(() => {
    if (minutosPorServico <= 0) return 0;
    return Math.floor((horasUteisDia * 60) / minutosPorServico * diasUteisMes);
  }, [horasUteisDia, minutosPorServico, diasUteisMes]);

  const custosServicos = useMemo(() => {
    const total =
      aluguel +
      impostosServ +
      contador +
      insumos +
      midia +
      telefonia +
      mobilidade +
      salarios +
      outrosCustos;
    const custoPorServico =
      quantidadeServicosEfetivos > 0 ? total / quantidadeServicosEfetivos : 0;
    const faturamentoNecessario = total + ganhosLiquidosPretendidos;
    const precoPorServico =
      quantidadeServicosEfetivos > 0
        ? faturamentoNecessario / quantidadeServicosEfetivos
        : 0;
    return {
      total,
      custoPorServico,
      faturamentoNecessario,
      precoPorServico,
    };
  }, [
    aluguel,
    impostosServ,
    contador,
    insumos,
    midia,
    telefonia,
    mobilidade,
    salarios,
    outrosCustos,
    quantidadeServicosEfetivos,
    ganhosLiquidosPretendidos,
  ]);

  /* --- Painel Financeiro (12 meses) --- */
  const empty12 = () => Array(12).fill(0);
  const [receitaProdutos, setReceitaProdutos] = useState<number[]>(() => {
    const a = empty12();
    a[2] = 13;
    return a;
  });
  const [receitaServicos, setReceitaServicos] = useState<number[]>(empty12);
  const [cmv, setCmv] = useState<number[]>(() => {
    const a = empty12();
    a[2] = 200;
    return a;
  });
  const [comissoes, setComissoes] = useState<number[]>(empty12);
  const [aluguelMes, setAluguelMes] = useState<number[]>(() => {
    const a = empty12();
    a[2] = 1;
    return a;
  });
  const [agua, setAgua] = useState<number[]>(empty12);
  const [luz, setLuz] = useState<number[]>(empty12);
  const [contabilidade, setContabilidade] = useState<number[]>(empty12);
  const [impostos, setImpostos] = useState<number[]>(empty12);
  const [software, setSoftware] = useState<number[]>(empty12);
  const [internet, setInternet] = useState<number[]>(empty12);
  const [telefone, setTelefone] = useState<number[]>(empty12);
  const [emprestimos, setEmprestimos] = useState<number[]>(empty12);
  const [retiradas, setRetiradas] = useState<number[]>(empty12);

  const updateMes = (
    setter: React.Dispatch<React.SetStateAction<number[]>>,
    index: number,
    value: number
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value >= 0 ? value : 0;
      return next;
    });
  };

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const painelTotais = useMemo(() => {
    const receitaTotalMes = receitaProdutos.map((p, i) => p + receitaServicos[i]);
    const custoVendaMes = cmv.map((c, i) => c + comissoes[i]);
    const despesasFixasMes = aluguelMes.map((a, i) => a + agua[i] + luz[i] + contabilidade[i] + impostos[i]);
    const despesasVarMes = software.map((s, i) => s + internet[i] + telefone[i]);
    const despesasOutrasMes = emprestimos.map((e, i) => e + retiradas[i]);
    const totalReceita = sum(receitaTotalMes);
    const totalDespesas =
      sum(custoVendaMes) + sum(despesasFixasMes) + sum(despesasVarMes) + sum(despesasOutrasMes);
    const saldo = totalReceita - totalDespesas;
    return {
      receitaTotalMes,
      acumuladoReceita: sum(receitaProdutos) + sum(receitaServicos),
      custoVendaMes,
      acumuladoCustoVenda: sum(cmv) + sum(comissoes),
      despesasFixasMes,
      acumuladoDespesasFixas: sum(aluguelMes) + sum(agua) + sum(luz) + sum(contabilidade) + sum(impostos),
      despesasVarMes,
      acumuladoDespesasVar: sum(software) + sum(internet) + sum(telefone),
      despesasOutrasMes,
      acumuladoDespesasOutras: sum(emprestimos) + sum(retiradas),
      totalReceita,
      totalDespesas,
      saldo,
    };
  }, [
    receitaProdutos,
    receitaServicos,
    cmv,
    comissoes,
    aluguelMes,
    agua,
    luz,
    contabilidade,
    impostos,
    software,
    internet,
    telefone,
    emprestimos,
    retiradas,
  ]);

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "0,00");

  /* --- Lançamentos --- */
  interface Lancamento {
    id: string;
    dataPagamento: string;
    mes: string;
    tipo: "R" | "D";
    planoContas: string;
    descricao: string;
    valor: number;
    status: "PAGO" | "PENDENTE";
  }
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([
    { id: "1", dataPagamento: "22/03/2024", mes: "março", tipo: "R", planoContas: "Aluguel", descricao: "Aluguel Loja", valor: 1, status: "PAGO" },
    { id: "2", dataPagamento: "22/03/2024", mes: "março", tipo: "R", planoContas: "Receita Produtos", descricao: "Venda Canecas Personalizadas", valor: 13, status: "PAGO" },
    { id: "3", dataPagamento: "23/03/2024", mes: "março", tipo: "D", planoContas: "CMV", descricao: "Compra de Material", valor: 200, status: "PAGO" },
  ]);
  const addLancamento = () => {
    setLancamentos((prev) => [
      ...prev,
      { id: String(Date.now()), dataPagamento: "", mes: "", tipo: "R", planoContas: "", descricao: "", valor: 0, status: "PENDENTE" },
    ]);
  };
  const updateLancamento = (id: string, field: keyof Lancamento, value: string | number) => {
    setLancamentos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };
  const removeLancamento = (id: string) => {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
  };

  /* --- Cadastro (Plano de contas) --- */
  const [receitasItens, setReceitasItens] = useState(["Receita Produtos", "Receita Serviços"]);
  const [custoVendaItens, setCustoVendaItens] = useState(["CMV", "Comissões"]);
  const [despesasFixasItens, setDespesasFixasItens] = useState(["Aluguel", "Água", "Luz", "Contabilidade", "Impostos"]);
  const [despesasVarItens, setDespesasVarItens] = useState(["Software", "Internet", "Telefone"]);
  const [despesasOutrasItens, setDespesasOutrasItens] = useState(["Empréstimos", "Retiradas"]);

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    novo: string
  ) => {
    if (!novo.trim()) return;
    setter((prev) => [...prev, novo.trim()]);
  };
  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  /* --- Autenticação (entrada no sistema) --- */
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          nome: (session.user.user_metadata?.full_name as string) || session.user.email?.split("@")[0] || "Usuário",
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          nome: (session.user.user_metadata?.full_name as string) || session.user.email?.split("@")[0] || "Usuário",
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  /* --- Modal Criar conta gratuita --- */
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupForm, setSignupForm] = useState({ nome: "", email: "", senha: "" });

  /* --- Benefícios MEI Pro colapsável --- */
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [benefitsUseCount, setBenefitsUseCount] = useState(getStoredBenefitsCount);
  const hasProSubscription = false; // TODO: integrar com assinatura quando existir
  const benefitsUsesRemaining = Math.max(0, BENEFITS_USE_LIMIT - benefitsUseCount);
  const canUseBenefits = hasProSubscription || benefitsUsesRemaining > 0;

  /* --- Modal Login --- */
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.email.trim()) return;
    setSignupError(null);
    setSignupLoading(true);
    try {
      const result = await signUpWithSupabase(
        signupForm.nome,
        signupForm.email,
        signupForm.senha
      );
      if (result.ok) {
        if (result.user && result.hasSession) {
          setUser(result.user);
          setSignupSuccess(true);
          setTimeout(() => {
            setShowSignupModal(false);
            setSignupSuccess(false);
            setSignupForm({ nome: "", email: "", senha: "" });
            document.getElementById("precificacao")?.scrollIntoView({ behavior: "smooth" });
          }, 1500);
        } else if (result.user) {
          setSignupSuccess(true);
          setTimeout(() => {
            setShowSignupModal(false);
            setSignupSuccess(false);
            setSignupForm({ nome: "", email: "", senha: "" });
          }, 2500);
        }
      } else {
        setSignupError(result.message);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const closeSignupModal = () => {
    if (!signupLoading) {
      setShowSignupModal(false);
      setSignupError(null);
      setSignupForm({ nome: "", email: "", senha: "" });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim()) return;
    setLoginError(null);
    setLoginLoading(true);
    try {
      const result = await signInWithSupabase(loginForm.email, loginForm.senha);
      if (result.ok && result.user) {
        setUser(result.user);
        setShowLoginModal(false);
        setLoginForm({ email: "", senha: "" });
        document.getElementById("precificacao")?.scrollIntoView({ behavior: "smooth" });
      } else {
        setLoginError(result.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const closeLoginModal = () => {
    if (!loginLoading) {
      setShowLoginModal(false);
      setLoginError(null);
      setLoginForm({ email: "", senha: "" });
    }
  };

  return (
    <div className="page">
      <header className="site-header">
        <div className="shell">
          <div className="site-header-inner">
            <a href="#inicio" className="brand">
              <img
                src="/logo-meu-mei-pro.png"
                alt="Meu MEI Pro"
                className="brand-logo"
              />
            </a>
            <nav className="nav">
              <a href="#sobre">Sobre</a>
              <a href="#recursos">Recursos</a>
              <a href="#precificacao">Precificação</a>
              <a href="#planos">Planos</a>
              <a href="#faq">Dúvidas</a>
            </nav>
            {user ? (
              <div className="header-user">
                <span className="header-greeting">Olá, {user.nome}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm header-logout"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="header-auth-buttons">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm header-login"
                  onClick={() => setShowLoginModal(true)}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className="nav-cta"
                  onClick={() => setShowSignupModal(true)}
                >
                  Começar agora
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero principal inspirado na página dos AirPods */}
        <section className="hero" id="inicio">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Plataforma para MEI totalmente digital</p>
              <h1>Organize seu MEI com experiência de nível Pro.</h1>
              <p className="hero-subtitle">
                Centralize boletos, impostos, notas fiscais e relatórios em um
                painel elegante, fluido e pensado para o dia a dia de quem
                empreende sozinho.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSignupModal(true)}
                >
                  Criar meu controle de MEI
                </button>
                <a href="#recursos" className="btn btn-ghost">
                  Ver recursos
                </a>
              </div>
              <p className="hero-footnote">
                Teste grátis por 7 dias. Sem cartão de crédito.
              </p>
            </div>

            <div className="hero-visual">
              <div className="hero-orbit">
                <div className="hero-orbit-ring hero-orbit-ring-lg" />
                <div className="hero-orbit-ring hero-orbit-ring-md" />
                <div className="hero-orbit-ring hero-orbit-ring-sm" />
                <div className="hero-card hero-card-main">
                  <div className="hero-card-header">
                    <span className="pill pill-green">Saudável</span>
                    <span className="hero-card-title">Resumo do seu MEI</span>
                  </div>
                  <div className="hero-card-body">
                    <div className="metric-row">
                      <div>
                        <span className="metric-label">Faturamento do mês</span>
                        <span className="metric-value">R$ 8.750,00</span>
                      </div>
                      <span className="metric-trend up">+18%</span>
                    </div>
                    <div className="metric-row">
                      <div>
                        <span className="metric-label">
                          DAS e obrigações
                        </span>
                        <span className="metric-value">Tudo em dia</span>
                      </div>
                      <span className="metric-pill">Próximo em 05 dias</span>
                    </div>
                    <div className="pill-row">
                      <span className="tag">Notas emitidas</span>
                      <span className="tag tag-soft">Clientes ativos</span>
                      <span className="tag tag-soft">Relatórios</span>
                    </div>
                  </div>
                </div>
                <div className="hero-card hero-card-float hero-card-left">
                  <p className="hero-float-label">Alertas inteligentes</p>
                  <p className="hero-float-value">
                    Lembramos você de cada prazo importante.
                  </p>
                </div>
                <div className="hero-card hero-card-float hero-card-right">
                  <p className="hero-float-label">Fluxo de caixa</p>
                  <p className="hero-float-value">
                    Veja entradas e saídas em tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de destaques / “Conheça melhor” */}
        <section className="section" id="sobre">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Pensado para o seu dia a dia</p>
              <h2>Visual limpo, foco total na gestão do seu MEI.</h2>
              <p className="section-subtitle">
                Mantemos o conteúdo e as funcionalidades que você já usa, mas
                com uma apresentação muito mais fluida, moderna e responsiva,
                inspirada na experiência da página dos AirPods{" "}
                <span className="muted">(Apple)</span>.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <h3>Painel em tempo real</h3>
                <p>
                  Acompanhe faturamento, impostos e obrigações em um único
                  lugar, com cards dinâmicos que se adaptam a qualquer tela.
                </p>
              </article>
              <article className="feature-card">
                <h3>Fluxo totalmente fluido</h3>
                <p>
                  Transições suaves, layout responsivo e tipografia clara,
                  mantendo as mesmas informações do seu projeto atual.
                </p>
              </article>
              <article className="feature-card">
                <h3>Pronto para crescer</h3>
                <p>
                  Estrutura pensada para você incluir novos módulos como
                  emissão de notas, relatórios avançados e integração bancária.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Grid de comparação / “Qual é o plano ideal para você?” */}
        <section className="section section-alt" id="planos">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Planos que acompanham o seu ritmo</p>
              <h2>Escolha o modo como quer cuidar do seu MEI.</h2>
            </div>

            <div className="plans-grid">
              <article className="plan-card">
                <p className="plan-tag">Essencial</p>
                <h3>Controle básico sem complicação</h3>
                <p className="plan-price">R$ 0</p>
                <p className="plan-caption">Ideal para começar agora.</p>
                <ul className="plan-list">
                  <li>Resumo mensal do MEI</li>
                  <li>Alertas de vencimento do DAS</li>
                  <li>Organização simples de receitas</li>
                </ul>
              </article>

              <article className="plan-card plan-card-highlight">
                <p className="plan-tag">Pro</p>
                <h3>Experiência completa Meu MEI Pro</h3>
                <p className="plan-price">R$ 29/mês</p>
                <p className="plan-caption">
                  Tudo o que você já usa, com visual e fluxo elevados ao nível
                  Pro.
                </p>
                <ul className="plan-list">
                  <li>Precificação de produtos e serviços (calculadoras interativas)</li>
                  <li>Controle Financeiro: Lançamentos, Painel Finanças e Cadastro de Receitas e Despesas</li>
                  <li>Painel com métricas avançadas</li>
                  <li>Relatórios personalizados por período</li>
                  <li>Exportação de dados</li>
                  <li>Suporte priorizado por e-mail</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Blocos explicativos em estilo “Conheça melhor os AirPods” */}
        <section className="section" id="recursos">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Conheça melhor o Meu MEI Pro</p>
              <h2>Recursos que deixam sua rotina mais leve.</h2>
            </div>

            <div className="info-grid">
              <article className="info-card">
                <h3>Saúde do MEI</h3>
                <p>
                  Veja se seus impostos, declarações e limites de faturamento
                  estão em dia, com indicadores claros e objetivos.
                </p>
              </article>
              <article className="info-card">
                <h3>Alertas inteligentes</h3>
                <p>
                  Receba lembretes sobre prazos importantes antes que virem
                  problema — nada de surpresas com multas.
                </p>
              </article>
              <article className="info-card">
                <h3>Visão de futuro</h3>
                <p>
                  Acompanhe sua evolução mês a mês e entenda quando é hora de
                  investir mais ou segurar um pouco.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Precificação de Produtos e Serviços — Benefício Meu MEI Pro */}
        <section className="section section-alt" id="precificacao">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Benefício Meu MEI Pro</p>
              <h2>Precificação de Produtos e Serviços.</h2>
              <p className="section-subtitle">
                Quem assina o Meu MEI Pro tem acesso a estas ferramentas: calcule
                o preço de venda e a composição dos custos para manter margem e
                lucro sob controle. Use os campos abaixo para personalizar os
                cálculos.
              </p>
              <p className="benefit-badge">
                <span className="pill pill-green">Incluído no plano Pro</span>
              </p>
            </div>

            <div className={`benefits-collapsible ${benefitsExpanded ? "is-expanded" : ""}`}>
              <div className="benefits-collapsible-inner">
              <div className="benefits-collapsible-content">
            <div className="pricing-block">
              <h3 className="pricing-block-title">Precificação de Produtos</h3>

              <div className="pricing-grid">
                <div className="pricing-card">
                  <h4 className="pricing-card-title">Cálculo do preço por produto</h4>
                  <table className="pricing-table">
                    <tbody>
                      <tr>
                        <td>Custo do produto</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={0.01}
                            value={custoProduto}
                            onChange={(e) => setCustoProduto(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">—</td>
                      </tr>
                      <tr>
                        <td>Markup desejado</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0.1}
                            step={0.1}
                            value={markupDesejado}
                            onChange={(e) => setMarkupDesejado(parseFloat(e.target.value) || 1)}
                          />
                        </td>
                        <td className="pct">{markupPct.toFixed(1)}%</td>
                      </tr>
                      <tr className="highlight">
                        <td>Preço calculado</td>
                        <td className="num">{formatBrl(precoCalculado)}</td>
                        <td className="pct">—</td>
                      </tr>
                      <tr>
                        <td>Lucro bruto</td>
                        <td className="num positive">{formatBrl(lucroBruto)}</td>
                        <td className="pct">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pricing-card" id="precificacao-produtos">
                  <h4 className="pricing-card-title">Composição do preço por produto</h4>
                  <table className="pricing-table">
                    <tbody>
                      <tr>
                        <td>Impostos (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={impostosPct}
                            onChange={(e) => setImpostosPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.impostosVal)}</td>
                      </tr>
                      <tr>
                        <td>Taxa cartão (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={taxaCartaoPct}
                            onChange={(e) => setTaxaCartaoPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.taxaCartaoVal)}</td>
                      </tr>
                      <tr>
                        <td>Comissões plataformas (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={comissaoPlataformasPct}
                            onChange={(e) => setComissaoPlataformasPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.comissaoPlatVal)}</td>
                      </tr>
                      <tr>
                        <td>Comissões vendedores (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={comissaoVendedoresPct}
                            onChange={(e) => setComissaoVendedoresPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.comissaoVendVal)}</td>
                      </tr>
                      <tr>
                        <td>Marketing (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={marketingPct}
                            onChange={(e) => setMarketingPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.marketingVal)}</td>
                      </tr>
                      <tr>
                        <td>Outros (%)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input pricing-input-pct"
                            min={0}
                            step={0.1}
                            value={outrosPct}
                            onChange={(e) => setOutrosPct(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">→ {formatBrl(deducoesProduto.outrosPctVal)}</td>
                      </tr>
                      <tr>
                        <td>Frete grátis (R$)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={0.01}
                            value={freteGratisRs}
                            onChange={(e) => setFreteGratisRs(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">
                          {precoCalculado > 0 ? ((freteGratisRs / precoCalculado) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                      <tr>
                        <td>Embalagem (R$)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={0.01}
                            value={embalagemRs}
                            onChange={(e) => setEmbalagemRs(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">
                          {precoCalculado > 0 ? ((embalagemRs / precoCalculado) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                      <tr>
                        <td>Outros (R$)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={0.01}
                            value={outrosRs}
                            onChange={(e) => setOutrosRs(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="pct">
                          {precoCalculado > 0 ? ((outrosRs / precoCalculado) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                      <tr className="total">
                        <td>Total das deduções</td>
                        <td className="num">{formatBrl(deducoesProduto.total)}</td>
                        <td className="pct">{deducoesProduto.totalPct.toFixed(1)}%</td>
                      </tr>
                      <tr className="highlight">
                        <td>Margem de contribuição do produto</td>
                        <td className="num positive">{formatBrl(deducoesProduto.margemContrib)}</td>
                        <td className="pct">{deducoesProduto.margemPct.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Precificação de Serviços */}
            <div className="pricing-block" id="precificacao-servicos">
              <h3 className="pricing-block-title">Precificação de Serviços</h3>

              <div className="pricing-grid">
                <div className="pricing-card">
                  <h4 className="pricing-card-title">Cálculo da capacidade de produção</h4>
                  <table className="pricing-table">
                    <tbody>
                      <tr>
                        <td>Horas úteis por dia</td>
                        <td className="num" colSpan={2}>
                          <input
                            type="number"
                            className="pricing-input"
                            min={0.1}
                            max={24}
                            step={0.5}
                            value={horasUteisDia}
                            onChange={(e) => setHorasUteisDia(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Minutos gastos por serviço</td>
                        <td className="num" colSpan={2}>
                          <input
                            type="number"
                            className="pricing-input"
                            min={1}
                            step={1}
                            value={minutosPorServico}
                            onChange={(e) => setMinutosPorServico(parseFloat(e.target.value) || 1)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Dias úteis no mês</td>
                        <td className="num" colSpan={2}>
                          <input
                            type="number"
                            className="pricing-input"
                            min={1}
                            max={31}
                            step={1}
                            value={diasUteisMes}
                            onChange={(e) => setDiasUteisMes(parseFloat(e.target.value) || 1)}
                          />
                        </td>
                      </tr>
                      <tr className="highlight">
                        <td>Capacidade de serviços por mês</td>
                        <td className="num" colSpan={2}>{capacidadeServicos}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pricing-card pricing-card-wide">
                  <h4 className="pricing-card-title">Composição do preço por serviço</h4>
                  <p className="pricing-meta">
                    Quantidade de serviços efetivos no mês:{" "}
                    <input
                      type="number"
                      className="pricing-input pricing-input-inline"
                      min={1}
                      value={quantidadeServicosEfetivos}
                      onChange={(e) =>
                        setQuantidadeServicosEfetivos(Math.max(1, parseFloat(e.target.value) || 1))
                      }
                    />
                  </p>
                  <table className="pricing-table">
                    <tbody>
                      <tr>
                        <td>Aluguel</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={aluguel}
                            onChange={(e) => setAluguel(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Impostos</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={impostosServ}
                            onChange={(e) => setImpostosServ(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Contador</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={contador}
                            onChange={(e) => setContador(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Insumos</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={insumos}
                            onChange={(e) => setInsumos(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Mídia</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={midia}
                            onChange={(e) => setMidia(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Telefonia/Internet</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={telefonia}
                            onChange={(e) => setTelefonia(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Mobilidade</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={mobilidade}
                            onChange={(e) => setMobilidade(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Salários/Comissões</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={salarios}
                            onChange={(e) => setSalarios(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Outros</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={10}
                            value={outrosCustos}
                            onChange={(e) => setOutrosCustos(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                      <tr className="total">
                        <td>Total custos da operação por mês</td>
                        <td className="num">{formatBrl(custosServicos.total)}</td>
                      </tr>
                      <tr>
                        <td>Ganhos líquidos pretendidos no mês (R$)</td>
                        <td className="num">
                          <input
                            type="number"
                            className="pricing-input"
                            min={0}
                            step={100}
                            value={ganhosLiquidosPretendidos}
                            onChange={(e) =>
                              setGanhosLiquidosPretendidos(parseFloat(e.target.value) || 0)
                            }
                          />
                        </td>
                      </tr>
                      <tr className="highlight">
                        <td>Faturamento necessário</td>
                        <td className="num">{formatBrl(custosServicos.faturamentoNecessario)}</td>
                      </tr>
                      <tr>
                        <td>Custo por serviço (R$)</td>
                        <td className="num">{formatBrl(custosServicos.custoPorServico)}</td>
                      </tr>
                      <tr className="highlight">
                        <td>Preço por serviço (R$)</td>
                        <td className="num positive">
                          {formatBrl(custosServicos.precoPorServico)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Controle Financeiro — Benefício Pro */}
            <div className="pricing-block" id="controle-financeiro">
              <h3 className="pricing-block-title">Controle Financeiro</h3>
              <p className="pricing-meta pricing-meta-spaced">
                Acesso a Lançamentos, Painel Financeiro e Cadastro de Receitas e Despesas.
              </p>
              <div className="benefit-buttons">
                <span className="benefit-btn">Lançamentos</span>
                <span className="benefit-btn">Painel Finanças</span>
                <span className="benefit-btn">Cadastro Receitas e Despesas</span>
              </div>
            </div>

            {/* Painel Financeiro — interativo */}
            <div className="pricing-block">
              <h3 className="pricing-block-title">Painel Financeiro</h3>
              <div className="pricing-card pricing-card-wide">
                <div className="financial-table-wrap">
                  <table className="pricing-table financial-panel-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th className="num">Acumulado Ano</th>
                        <th className="num">Jan</th>
                        <th className="num">Fev</th>
                        <th className="num">Mar</th>
                        <th className="num">Abr</th>
                        <th className="num">Mai</th>
                        <th className="num">Jun</th>
                        <th className="num">Jul</th>
                        <th className="num">Ago</th>
                        <th className="num">Set</th>
                        <th className="num">Out</th>
                        <th className="num">Nov</th>
                        <th className="num">Dez</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row-group"><td colSpan={14} className="group-label">RECEITAS</td></tr>
                      {[
                        ["Receita Produtos", receitaProdutos, setReceitaProdutos, false],
                        ["Receita Serviços", receitaServicos, setReceitaServicos, false],
                      ].map(([label, arr, setter, neg]) => (
                        <tr key={String(label)}>
                          <td>{label}</td>
                          <td className="num">{fmt(sum(arr as number[]))}</td>
                          {(arr as number[]).map((v, i) => (
                            <td key={i} className="num">
                              <input type="number" className="pricing-input pricing-input-cell" step={0.01} min={0} value={v || ""} onChange={(e) => updateMes(setter as React.Dispatch<React.SetStateAction<number[]>>, i, parseFloat(e.target.value) || 0)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="highlight"><td>Receita Total</td><td className="num positive">{fmt(painelTotais.acumuladoReceita)}</td>{painelTotais.receitaTotalMes.map((v, i) => <td key={i} className="num positive">{fmt(v)}</td>)}</tr>
                      <tr className="row-group"><td colSpan={14} className="group-label">CUSTO VENDA</td></tr>
                      {[
                        ["CMV", cmv, setCmv, true],
                        ["Comissões", comissoes, setComissoes, true],
                      ].map(([label, arr, setter]) => (
                        <tr key={String(label)}>
                          <td>{label}</td>
                          <td className="num negative">({fmt(sum(arr as number[]))})</td>
                          {(arr as number[]).map((v, i) => (
                            <td key={i} className="num">
                              <input type="number" className="pricing-input pricing-input-cell" step={0.01} min={0} value={v || ""} onChange={(e) => updateMes(setter as React.Dispatch<React.SetStateAction<number[]>>, i, parseFloat(e.target.value) || 0)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="highlight"><td>CUSTO VENDA</td><td className="num negative">({fmt(painelTotais.acumuladoCustoVenda)})</td>{painelTotais.custoVendaMes.map((v, i) => <td key={i} className="num negative">({fmt(v)})</td>)}</tr>
                      <tr className="row-group"><td colSpan={14} className="group-label">DESPESAS FIXAS</td></tr>
                      {[
                        ["Aluguel", aluguelMes, setAluguelMes],
                        ["Água", agua, setAgua],
                        ["Luz", luz, setLuz],
                        ["Contabilidade", contabilidade, setContabilidade],
                        ["Impostos", impostos, setImpostos],
                      ].map(([label, arr, setter]) => (
                        <tr key={String(label)}>
                          <td>{label}</td>
                          <td className="num negative">({fmt(sum(arr as number[]))})</td>
                          {(arr as number[]).map((v, i) => (
                            <td key={i} className="num">
                              <input type="number" className="pricing-input pricing-input-cell" step={0.01} min={0} value={v || ""} onChange={(e) => updateMes(setter as React.Dispatch<React.SetStateAction<number[]>>, i, parseFloat(e.target.value) || 0)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="highlight"><td>DESPESAS FIXAS</td><td className="num negative">({fmt(painelTotais.acumuladoDespesasFixas)})</td>{painelTotais.despesasFixasMes.map((v, i) => <td key={i} className="num negative">({fmt(v)})</td>)}</tr>
                      <tr className="row-group"><td colSpan={14} className="group-label">DESPESAS VARIÁVEIS</td></tr>
                      {[
                        ["Software", software, setSoftware],
                        ["Internet", internet, setInternet],
                        ["Telefone", telefone, setTelefone],
                      ].map(([label, arr, setter]) => (
                        <tr key={String(label)}>
                          <td>{label}</td>
                          <td className="num negative">({fmt(sum(arr as number[]))})</td>
                          {(arr as number[]).map((v, i) => (
                            <td key={i} className="num">
                              <input type="number" className="pricing-input pricing-input-cell" step={0.01} min={0} value={v || ""} onChange={(e) => updateMes(setter as React.Dispatch<React.SetStateAction<number[]>>, i, parseFloat(e.target.value) || 0)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="highlight"><td>DESPESAS VARIÁVEIS</td><td className="num negative">({fmt(painelTotais.acumuladoDespesasVar)})</td>{painelTotais.despesasVarMes.map((v, i) => <td key={i} className="num negative">({fmt(v)})</td>)}</tr>
                      <tr className="row-group"><td colSpan={14} className="group-label">DESPESAS OUTRAS</td></tr>
                      {[
                        ["Empréstimos", emprestimos, setEmprestimos],
                        ["Retiradas", retiradas, setRetiradas],
                      ].map(([label, arr, setter]) => (
                        <tr key={String(label)}>
                          <td>{label}</td>
                          <td className="num negative">({fmt(sum(arr as number[]))})</td>
                          {(arr as number[]).map((v, i) => (
                            <td key={i} className="num">
                              <input type="number" className="pricing-input pricing-input-cell" step={0.01} min={0} value={v || ""} onChange={(e) => updateMes(setter as React.Dispatch<React.SetStateAction<number[]>>, i, parseFloat(e.target.value) || 0)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="highlight"><td>DESPESAS OUTRAS</td><td className="num negative">({fmt(painelTotais.acumuladoDespesasOutras)})</td>{painelTotais.despesasOutrasMes.map((v, i) => <td key={i} className="num negative">({fmt(v)})</td>)}</tr>
                      <tr className="total"><td>Total Receita</td><td className="num positive">{fmt(painelTotais.totalReceita)}</td><td colSpan={12}></td></tr>
                      <tr className="total"><td>Total Despesas</td><td className="num negative">({fmt(painelTotais.totalDespesas)})</td><td colSpan={12}></td></tr>
                      <tr className="total highlight"><td>Saldo Acumulado</td><td className={painelTotais.saldo >= 0 ? "num positive" : "num negative"}>{painelTotais.saldo >= 0 ? fmt(painelTotais.saldo) : `(${fmt(-painelTotais.saldo)})`}</td><td colSpan={12}></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lançamentos — interativo */}
            <div className="pricing-block">
              <h3 className="pricing-block-title">Lançamentos</h3>
              <div className="pricing-card pricing-card-wide">
                <div className="lancamentos-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={addLancamento}>
                    + Adicionar lançamento
                  </button>
                </div>
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
                          <td><input type="text" className="pricing-input pricing-input-inline-cell" placeholder="dd/mm/aaaa" value={l.dataPagamento} onChange={(e) => updateLancamento(l.id, "dataPagamento", e.target.value)} /></td>
                          <td><input type="text" className="pricing-input pricing-input-inline-cell" placeholder="mês" value={l.mes} onChange={(e) => updateLancamento(l.id, "mes", e.target.value)} /></td>
                          <td>
                            <div className="radio-group-inline">
                              <label className={`radio-option-inline radio-receita ${l.tipo === "R" ? "is-selected" : ""}`}>
                                <input type="radio" name={`tipo-${l.id}`} value="R" checked={l.tipo === "R"} onChange={() => updateLancamento(l.id, "tipo", "R")} />
                                <span className="radio-dot" /> R
                              </label>
                              <label className={`radio-option-inline radio-despesa ${l.tipo === "D" ? "is-selected" : ""}`}>
                                <input type="radio" name={`tipo-${l.id}`} value="D" checked={l.tipo === "D"} onChange={() => updateLancamento(l.id, "tipo", "D")} />
                                <span className="radio-dot" /> D
                              </label>
                            </div>
                          </td>
                          <td><input type="text" className="pricing-input pricing-input-inline-cell" placeholder="Conta" value={l.planoContas} onChange={(e) => updateLancamento(l.id, "planoContas", e.target.value)} /></td>
                          <td><input type="text" className="pricing-input pricing-input-inline-cell" placeholder="Descrição" value={l.descricao} onChange={(e) => updateLancamento(l.id, "descricao", e.target.value)} /></td>
                          <td className="num"><input type="number" className="pricing-input pricing-input-cell" step={0.01} value={l.valor || ""} onChange={(e) => updateLancamento(l.id, "valor", parseFloat(e.target.value) || 0)} /></td>
                          <td>
                            <div className="radio-group-inline">
                              <label className={`radio-option-inline radio-pago ${l.status === "PAGO" ? "is-selected" : ""}`}>
                                <input type="radio" name={`status-${l.id}`} value="PAGO" checked={l.status === "PAGO"} onChange={() => updateLancamento(l.id, "status", "PAGO")} />
                                <span className="radio-dot" /> PAGO
                              </label>
                              <label className={`radio-option-inline radio-pendente ${l.status === "PENDENTE" ? "is-selected" : ""}`}>
                                <input type="radio" name={`status-${l.id}`} value="PENDENTE" checked={l.status === "PENDENTE"} onChange={() => updateLancamento(l.id, "status", "PENDENTE")} />
                                <span className="radio-dot" /> PEND.
                              </label>
                            </div>
                          </td>
                          <td><button type="button" className="btn-remove" onClick={() => removeLancamento(l.id)} title="Remover">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Cadastro de Receitas e Despesas — interativo */}
            <div className="pricing-block">
              <h3 className="pricing-block-title">Cadastro de Receitas e Despesas</h3>
              <div className="pricing-grid">
                <div className="pricing-card">
                  <h4 className="pricing-card-title">Plano de contas</h4>
                  <p className="pricing-meta">Adicione ou remova itens em cada grupo. Os itens ficam disponíveis no Plano de Contas dos Lançamentos.</p>
                  <CadastroGrupo label="RECEITAS" itens={receitasItens} setItens={setReceitasItens} addItem={addItem} removeItem={removeItem} />
                  <CadastroGrupo label="CUSTO VENDA" itens={custoVendaItens} setItens={setCustoVendaItens} addItem={addItem} removeItem={removeItem} />
                  <CadastroGrupo label="DESPESAS FIXAS" itens={despesasFixasItens} setItens={setDespesasFixasItens} addItem={addItem} removeItem={removeItem} />
                  <CadastroGrupo label="DESPESAS VARIÁVEIS" itens={despesasVarItens} setItens={setDespesasVarItens} addItem={addItem} removeItem={removeItem} />
                  <CadastroGrupo label="DESPESAS OUTRAS" itens={despesasOutrasItens} setItens={setDespesasOutrasItens} addItem={addItem} removeItem={removeItem} />
                </div>
                <div className="pricing-card">
                  <h4 className="pricing-card-title">Tipo e Status</h4>
                  <div className="tipo-status-block">
                    <div className="tipo-status-label">Tipo</div>
                    <div className="radio-group">
                      <label className="radio-option radio-receita">
                        <input type="radio" name="tipo-ref" value="R" defaultChecked />
                        <span className="radio-dot" />
                        <span className="radio-text">R – RECEITA</span>
                      </label>
                      <label className="radio-option radio-despesa">
                        <input type="radio" name="tipo-ref" value="D" />
                        <span className="radio-dot" />
                        <span className="radio-text">D – DESPESAS</span>
                      </label>
                    </div>
                    <div className="tipo-status-label">Status</div>
                    <div className="radio-group">
                      <label className="radio-option radio-pago">
                        <input type="radio" name="status-ref" value="PAGO" defaultChecked />
                        <span className="radio-dot" />
                        <span className="radio-text">PAGO</span>
                      </label>
                      <label className="radio-option radio-pendente">
                        <input type="radio" name="status-ref" value="PENDENTE" />
                        <span className="radio-dot" />
                        <span className="radio-text">PENDENTE</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
              <div className="benefits-fade" aria-hidden />
              </div>
              {benefitsExpanded ? (
                <>
                  <button
                    type="button"
                    className="benefits-show-more"
                    onClick={() => setBenefitsExpanded(false)}
                  >
                    Mostrar menos
                    <span className="benefits-chevron is-up">⌄</span>
                  </button>
                </>
              ) : canUseBenefits ? (
                <>
                  <button
                    type="button"
                    className="benefits-show-more"
                    onClick={() => {
                      setBenefitsExpanded(true);
                      if (!hasProSubscription) {
                        const next = benefitsUseCount + 1;
                        setBenefitsUseCount(next);
                        setStoredBenefitsCount(next);
                      }
                    }}
                  >
                    Mostrar mais
                    <span className="benefits-chevron">⌄</span>
                  </button>
                  {!hasProSubscription && (
                    <p className="benefits-usage-hint">
                      {benefitsUsesRemaining} de {BENEFITS_USE_LIMIT} usos restantes sem assinatura
                    </p>
                  )}
                </>
              ) : (
                <div className="benefits-limit-reached">
                  <p>Você atingiu o limite de {BENEFITS_USE_LIMIT} usos sem assinatura.</p>
                  <p className="benefits-limit-sub">Assine o Meu MEI Pro para acesso ilimitado às ferramentas.</p>
                  <button
                    type="button"
                    className="btn btn-primary benefits-cta"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Assinar Meu MEI Pro
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ simples */}
        <section className="section" id="faq">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Perguntas frequentes</p>
              <h2>Tire suas principais dúvidas.</h2>
            </div>

            <div className="faq-list">
              <details>
                <summary>Preciso mudar os dados que já cadastrei?</summary>
                <p>
                  Não. A ideia é manter o conteúdo que você já usa e apenas
                  entregar uma apresentação mais bonita, clara e fluida.
                </p>
              </details>
              <details>
                <summary>Funciona bem no celular?</summary>
                <p>
                  Sim. Todo o layout foi pensado para ser fluido, inspirado na
                  responsividade da página dos AirPods, se adaptando a telas
                  pequenas, médias e grandes.
                </p>
              </details>
              <details>
                <summary>Posso mudar os textos e seções depois?</summary>
                <p>
                  Claro. A estrutura em React facilita que você personalize
                  cópias, blocos e componentes sem quebrar o layout.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Call to action final */}
        <section className="section section-cta" id="cta">
          <div className="shell">
            <div className="cta-inner">
              <div className="cta-copy">
                <h2>Pronta para elevar seu MEI ao nível Pro?</h2>
                <p>
                  Em poucos minutos você organiza tudo o que já faz hoje, mas
                  em uma experiência muito mais moderna, fluida e agradável.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowSignupModal(true)}
              >
                Criar minha conta gratuita
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <img src="/logo-meu-mei-pro.png" alt="Meu MEI Pro" className="footer-logo" />
            <p>© {new Date().getFullYear()} Meu MEI Pro. Todos os direitos reservados.</p>
          </div>
          <div className="footer-links">
            <a href="#sobre">Sobre</a>
            <a href="#precificacao">Precificação</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </footer>

      {/* Modal Criar conta gratuita */}
      {showSignupModal && (
        <div
          className="modal-overlay"
          onClick={() => !signupSuccess && !signupLoading && closeSignupModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeSignupModal}
              disabled={signupLoading}
              aria-label="Fechar"
            >
              ×
            </button>
            {signupSuccess ? (
              <div className="modal-success">
                <p className="modal-success-icon">✓</p>
                <h3 id="modal-title">Conta criada com sucesso!</h3>
                <p>{user ? "Entrando no Meu MEI Pro..." : "Em breve você receberá um e-mail para confirmar sua conta (se a confirmação estiver ativada no Supabase)."}</p>
              </div>
            ) : (
              <>
                <h3 id="modal-title" className="modal-title">Criar minha conta gratuita</h3>
                <p className="modal-subtitle">Preencha os dados abaixo para começar.</p>
                {signupError && (
                  <div className="modal-error" role="alert">
                    {signupError}
                  </div>
                )}
                <form onSubmit={handleSignupSubmit} className="modal-form">
                  <label>
                    <span>Nome completo</span>
                    <input
                      type="text"
                      className="pricing-input modal-input"
                      placeholder="Seu nome"
                      value={signupForm.nome}
                      onChange={(e) => setSignupForm((f) => ({ ...f, nome: e.target.value }))}
                      disabled={signupLoading}
                    />
                  </label>
                  <label>
                    <span>E-mail</span>
                    <input
                      type="email"
                      className="pricing-input modal-input"
                      placeholder="seu@email.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      disabled={signupLoading}
                    />
                  </label>
                  <label>
                    <span>Senha</span>
                    <input
                      type="password"
                      className="pricing-input modal-input"
                      placeholder="Mínimo 6 caracteres"
                      value={signupForm.senha}
                      onChange={(e) => setSignupForm((f) => ({ ...f, senha: e.target.value }))}
                      minLength={6}
                      disabled={signupLoading}
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary modal-submit"
                    disabled={signupLoading}
                  >
                    {signupLoading ? "Criando conta..." : "Criar conta"}
                  </button>
                </form>
                <p className="modal-switch">
                  Já tem conta?{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      closeSignupModal();
                      setShowLoginModal(true);
                    }}
                  >
                    Entrar
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Login */}
      {showLoginModal && (
        <div
          className="modal-overlay"
          onClick={() => !loginLoading && closeLoginModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-login-title"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeLoginModal}
              disabled={loginLoading}
              aria-label="Fechar"
            >
              ×
            </button>
            <h3 id="modal-login-title" className="modal-title">Entrar no Meu MEI Pro</h3>
            <p className="modal-subtitle">Use seu e-mail e senha para acessar.</p>
            {loginError && (
              <div className="modal-error" role="alert">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLoginSubmit} className="modal-form">
              <label>
                <span>E-mail</span>
                <input
                  type="email"
                  className="pricing-input modal-input"
                  placeholder="seu@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  disabled={loginLoading}
                />
              </label>
              <label>
                <span>Senha</span>
                <input
                  type="password"
                  className="pricing-input modal-input"
                  placeholder="Sua senha"
                  value={loginForm.senha}
                  onChange={(e) => setLoginForm((f) => ({ ...f, senha: e.target.value }))}
                  disabled={loginLoading}
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary modal-submit"
                disabled={loginLoading}
              >
                {loginLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>
            <p className="modal-switch">
              Não tem conta?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  closeLoginModal();
                  setShowSignupModal(true);
                }}
              >
                Criar conta gratuita
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

