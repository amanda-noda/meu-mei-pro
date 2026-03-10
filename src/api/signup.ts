/**
 * Serviço de cadastro (criar conta).
 * A URL da API é definida em VITE_SIGNUP_API_URL no .env
 */

const SIGNUP_API_URL = import.meta.env.VITE_SIGNUP_API_URL as string | undefined;

export interface SignupPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface SignupSuccess {
  ok: true;
  message?: string;
  id?: string;
}

export interface SignupError {
  ok: false;
  message: string;
  code?: string;
}

export type SignupResponse = SignupSuccess | SignupError;

export async function createAccount(
  payload: SignupPayload
): Promise<SignupResponse> {
  if (!SIGNUP_API_URL?.trim()) {
    return {
      ok: false,
      message:
        "API não configurada. Defina VITE_SIGNUP_API_URL no arquivo .env",
    };
  }

  const url = SIGNUP_API_URL.replace(/\/$/, "");
  const endpoint = url.includes("/signup") ? url : `${url}/signup`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: payload.nome.trim(),
        email: payload.email.trim().toLowerCase(),
        senha: payload.senha,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : data?.error ?? `Erro ao criar conta (${res.status})`;
      return { ok: false, message, code: String(res.status) };
    }

    return {
      ok: true,
      message: data?.message,
      id: data?.id,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha de conexão. Tente de novo.";
    return { ok: false, message };
  }
}
