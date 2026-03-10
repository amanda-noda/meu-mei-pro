/**
 * Cadastro usando Supabase Auth.
 * Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env
 */

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface AppUser {
  id: string;
  email: string;
  nome: string;
}

export interface SignupResult {
  ok: boolean;
  message: string;
  user?: AppUser;
  /** true quando o usuário já está com sessão (entra no sistema sem confirmar e-mail) */
  hasSession?: boolean;
}

export async function signUpWithSupabase(
  nome: string,
  email: string,
  senha: string
): Promise<SignupResult> {
  if (!isSupabaseConfigured() || !supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    if (url?.trim() && !key?.trim()) {
      return {
        ok: false,
        message:
          "Falta a chave do Supabase. No .env, adicione VITE_SUPABASE_ANON_KEY com a Publishable key (Settings > API no painel Supabase). Depois reinicie o servidor (npm run dev).",
      };
    }
    return {
      ok: false,
      message:
        "Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (pegue em Settings > API no painel Supabase).",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: {
      data: {
        full_name: nome.trim(),
      },
    },
  });

  if (error) {
    const msg =
      error.message === "User already registered"
        ? "Este e-mail já está cadastrado. Faça login ou use outro e-mail."
        : error.message;
    return { ok: false, message: msg };
  }

  if (data?.user && !data.session && data.user.identities?.length === 0) {
    return {
      ok: false,
      message: "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
    };
  }

  const u = data?.user;
  if (!u) {
    return { ok: false, message: "Não foi possível criar a conta." };
  }

  const appUser: AppUser = {
    id: u.id,
    email: u.email ?? "",
    nome: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "Usuário",
  };
  return {
    ok: true,
    message: data.session
      ? "Conta criada! Entrando no sistema..."
      : "Conta criada! Verifique seu e-mail para confirmar (se a confirmação estiver ativada no Supabase).",
    user: appUser,
    hasSession: Boolean(data.session),
  };
}

export interface LoginResult {
  ok: boolean;
  message: string;
  user?: AppUser;
}

export async function signInWithSupabase(
  email: string,
  senha: string
): Promise<LoginResult> {
  if (!isSupabaseConfigured() || !supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    if (url?.trim() && !key?.trim()) {
      return {
        ok: false,
        message:
          "Falta a chave do Supabase. No .env, adicione VITE_SUPABASE_ANON_KEY.",
      };
    }
    return {
      ok: false,
      message:
        "Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos. Tente novamente."
        : error.message;
    return { ok: false, message: msg };
  }

  if (!data?.user) {
    return { ok: false, message: "Não foi possível fazer login." };
  }

  const appUser: AppUser = {
    id: data.user.id,
    email: data.user.email ?? "",
    nome: (data.user.user_metadata?.full_name as string) || data.user.email?.split("@")[0] || "Usuário",
  };

  return {
    ok: true,
    message: "Login realizado com sucesso!",
    user: appUser,
  };
}
