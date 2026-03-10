import React, { useState, useMemo } from "react";

function formatBrl(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const DashboardPrecificacao: React.FC = () => {
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

  return (
    <div className="dashboard-section">
      <h2 className="dashboard-section-title">Precificação</h2>
      <p className="pricing-meta pricing-meta-spaced">
        Calcule o preço de venda e a composição dos custos para manter margem e lucro sob controle.
      </p>

      {/* Precificação de Produtos */}
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

          <div className="pricing-card">
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
      <div className="pricing-block">
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
    </div>
  );
};
