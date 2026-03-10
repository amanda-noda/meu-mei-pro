/**
 * API do Dashboard: faturamento, DAS, notas fiscais
 */

import { supabase } from "../lib/supabase";

export interface Lancamento {
  id: string;
  user_id: string;
  data_pagamento: string;
  mes: string;
  tipo: "R" | "D";
  plano_contas: string;
  descricao: string;
  valor: number;
  status: "PAGO" | "PENDENTE";
  created_at?: string;
}

export interface NotaFiscal {
  id: string;
  user_id: string;
  numero: string;
  serie: string;
  data_emissao: string;
  valor: number;
  descricao: string;
  tipo: string;
  created_at?: string;
}

export interface MeiProfile {
  user_id: string;
  atividade: "comercio" | "servicos" | "ambos" | "transportador";
  cnpj?: string;
  razao_social?: string;
}

/** Valores do DAS MEI 2025 (atualizados) */
export const DAS_MEI_2025 = {
  comercio: { valor: 76.9, label: "Comércio/Indústria", vencimento: 20 },
  servicos: { valor: 80.9, label: "Prestação de Serviços", vencimento: 20 },
  ambos: { valor: 81.9, label: "Comércio + Serviços", vencimento: 20 },
  transportador: { valor: 185.16, label: "Transportador", vencimento: 20 },
} as const;

/** Obrigações do MEI (resumo) */
export const OBRIGACOES_MEI = [
  { id: "das", nome: "DAS", periodicidade: "Mensal", vencimento: "Até dia 20" },
  { id: "dasn", nome: "DASN-SIMEI", periodicidade: "Anual", vencimento: "Até 31/05" },
  { id: "relatorio", nome: "Relatório de Receitas", periodicidade: "Mensal", vencimento: "Até dia 20" },
];

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

function normalizarMes(mes: string): number {
  const m = mes?.toLowerCase().trim();
  return MESES_ORDEM[m ?? ""] ?? 0;
}

export async function getFaturamentoMes(userId: string): Promise<number> {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("lancamentos")
    .select("valor, mes, tipo")
    .eq("user_id", userId)
    .eq("tipo", "R");

  if (error) {
    console.warn("Erro ao buscar faturamento:", error);
    return 0;
  }

  const lancamentos = (data ?? []) as { valor: number; mes: string }[];
  const mesNum = new Date().getMonth() + 1;
  const total = lancamentos
    .filter((l) => {
      const n = normalizarMes(l.mes);
      return n === mesNum;
    })
    .reduce((s, l) => s + (Number(l.valor) || 0), 0);

  return total;
}

export async function getLancamentos(userId: string): Promise<Lancamento[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar lançamentos:", error);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ""),
    user_id: String(r.user_id ?? ""),
    data_pagamento: String(r.data_pagamento ?? ""),
    mes: String(r.mes ?? ""),
    tipo: (r.tipo as "R" | "D") ?? "R",
    plano_contas: String(r.plano_contas ?? ""),
    descricao: String(r.descricao ?? ""),
    valor: Number(r.valor) ?? 0,
    status: ((r.status as "PAGO" | "PENDENTE") ?? "PENDENTE") as "PAGO" | "PENDENTE",
    created_at: String(r.created_at ?? ""),
  })) as Lancamento[];
}

export async function addLancamento(
  userId: string,
  lancamento: Omit<Lancamento, "id" | "user_id">
): Promise<Lancamento | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lancamentos")
    .insert({
      user_id: userId,
      data_pagamento: lancamento.data_pagamento,
      mes: lancamento.mes,
      tipo: lancamento.tipo,
      plano_contas: lancamento.plano_contas,
      descricao: lancamento.descricao,
      valor: lancamento.valor,
      status: lancamento.status,
    })
    .select()
    .single();

  if (error) {
    console.warn("Erro ao adicionar lançamento:", error);
    return null;
  }
  return data as Lancamento;
}

export async function updateLancamento(
  userId: string,
  id: string,
  updates: Partial<Omit<Lancamento, "id" | "user_id">>
): Promise<Lancamento | null> {
  if (!supabase) return null;
  const payload: Record<string, unknown> = {};
  if (updates.data_pagamento !== undefined) payload.data_pagamento = updates.data_pagamento;
  if (updates.mes !== undefined) payload.mes = updates.mes;
  if (updates.tipo !== undefined) payload.tipo = updates.tipo;
  if (updates.plano_contas !== undefined) payload.plano_contas = updates.plano_contas;
  if (updates.descricao !== undefined) payload.descricao = updates.descricao;
  if (updates.valor !== undefined) payload.valor = updates.valor;
  if (updates.status !== undefined) payload.status = updates.status;
  if (Object.keys(payload).length === 0) return null;

  const { data, error } = await supabase
    .from("lancamentos")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.warn("Erro ao atualizar lançamento:", error);
    return null;
  }
  return data as Lancamento;
}

export async function deleteLancamento(userId: string, id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("lancamentos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.warn("Erro ao remover lançamento:", error);
    return false;
  }
  return true;
}

export async function getMeiProfile(userId: string): Promise<MeiProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("mei_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return {
    user_id: data.user_id,
    atividade: data.atividade ?? "servicos",
    cnpj: data.cnpj,
    razao_social: data.razao_social,
  };
}

export async function getDasInfo(userId: string) {
  const profile = await getMeiProfile(userId);
  const atividade = profile?.atividade ?? "servicos";
  const info = DAS_MEI_2025[atividade] ?? DAS_MEI_2025.servicos;
  const hoje = new Date().getDate();
  const vencimento = info.vencimento;
  const status = hoje <= vencimento ? "Em dia" : "Vencido";
  return {
    valor: info.valor,
    label: info.label,
    vencimento: `Dia ${vencimento}`,
    status,
    obrigacoes: OBRIGACOES_MEI,
  };
}

export async function getNotasFiscais(userId: string): Promise<NotaFiscal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("user_id", userId)
    .order("data_emissao", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar notas fiscais:", error);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ""),
    user_id: String(r.user_id ?? ""),
    numero: String(r.numero ?? ""),
    serie: String(r.serie ?? ""),
    data_emissao: String(r.data_emissao ?? ""),
    valor: Number(r.valor) ?? 0,
    descricao: String(r.descricao ?? ""),
    tipo: String(r.tipo ?? "NFC-e"),
    created_at: String(r.created_at ?? ""),
  })) as NotaFiscal[];
}

export async function addNotaFiscal(
  userId: string,
  nota: { numero?: string; serie?: string; data_emissao?: string; valor: number; descricao?: string; tipo?: string }
): Promise<NotaFiscal | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("notas_fiscais")
    .insert({
      user_id: userId,
      numero: nota.numero ?? "",
      serie: nota.serie ?? "",
      data_emissao: nota.data_emissao ?? null,
      valor: nota.valor,
      descricao: nota.descricao ?? "",
      tipo: nota.tipo ?? "NFC-e",
    })
    .select()
    .single();

  if (error) {
    console.warn("Erro ao adicionar nota fiscal:", error);
    return null;
  }
  return data as NotaFiscal;
}
