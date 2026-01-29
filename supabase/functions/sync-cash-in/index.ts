/* eslint-disable no-console */
// Lovable Cloud backend function: Create PIX cash-in via Sync Payments.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CashInRequest = {
  amount: number; // BRL
  description?: string;
  client: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function digitsOnly(value: unknown): string {
  return (asString(value) ?? "").replace(/\D+/g, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorJson(message: string, status = 400, details?: unknown) {
  // Never echo upstream/provider details to the browser.
  // Detailed diagnostics must stay in function logs.
  return json({ success: false, error: message }, status);
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

async function safeJson(resp: Response) {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorJson("Method not allowed", 405);
  }

  const SYNC_BASE_URL = normalizeBaseUrl(
    Deno.env.get("SYNC_BASE_URL") || "https://api.syncpayments.com.br",
  );
  const SYNC_CLIENT_ID = Deno.env.get("SYNC_CLIENT_ID");
  const SYNC_CLIENT_SECRET = Deno.env.get("SYNC_CLIENT_SECRET");
  const SYNC_WEBHOOK_URL = Deno.env.get("SYNC_WEBHOOK_URL");

  if (!SYNC_CLIENT_ID) return errorJson("SYNC_CLIENT_ID is not configured", 500);
  if (!SYNC_CLIENT_SECRET) return errorJson("SYNC_CLIENT_SECRET is not configured", 500);
  if (!SYNC_WEBHOOK_URL) return errorJson("SYNC_WEBHOOK_URL is not configured", 500);

  let payload: CashInRequest;
  try {
    payload = (await req.json()) as CashInRequest;
  } catch {
    return errorJson("Invalid JSON body", 400);
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return errorJson("amount must be a positive number (BRL)", 400);
  }

  const name = asString(payload.client?.name);
  const email = asString(payload.client?.email);
  const cpf = digitsOnly(payload.client?.cpf);
  const phone = digitsOnly(payload.client?.phone);

  if (!name || name.length < 2) return errorJson("client.name is required", 422);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return errorJson("client.email is invalid", 422);
  if (!cpf || cpf.length !== 11) return errorJson("client.cpf is invalid", 422);
  if (!phone || phone.length < 10 || phone.length > 11) return errorJson("client.phone is invalid", 422);

  const description = asString(payload.description);

  try {
    // 1) Get bearer token
    const authResp = await fetch(`${SYNC_BASE_URL}/api/partner/v1/auth-token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: SYNC_CLIENT_ID,
        client_secret: SYNC_CLIENT_SECRET,
      }),
    });

    const authData = await safeJson(authResp);
    if (!authResp.ok) {
      console.error("Sync auth-token failed", { status: authResp.status, data: authData });
      return errorJson(`Sync auth-token failed [${authResp.status}]`, authResp.status);
    }

    const accessToken = (authData as any)?.access_token;
    if (!accessToken || typeof accessToken !== "string") {
      console.error("Sync auth-token missing access_token", { data: authData });
      return errorJson("Sync auth-token response missing access_token", 500);
    }

    // 2) Create cash-in
    const cashInBody = {
      amount,
      description,
      webhook_url: SYNC_WEBHOOK_URL,
      client: {
        name,
        cpf,
        email,
        phone,
      },
    };

    // Avoid logging any PII (name/email/cpf/phone) in logs.
    console.log("Sync cash-in request", { amount, has_description: !!description });

    const cashResp = await fetch(`${SYNC_BASE_URL}/api/partner/v1/cash-in`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(cashInBody),
    });

    const cashData = await safeJson(cashResp);
    if (!cashResp.ok) {
      console.error("Sync cash-in failed", { status: cashResp.status, data: cashData });
      return errorJson(`Sync cash-in failed [${cashResp.status}]`, cashResp.status);
    }

    // Frontend expects a Pix code string (copy-and-paste). Sync returns pix_code.
    const pixCode = (cashData as any)?.pix_code;
    if (pixCode && typeof pixCode !== "string") {
      return errorJson("Sync cash-in returned invalid pix_code", 500, cashData);
    }

    // Return only what the frontend needs.
    return json({
      success: true,
      pix: { copy_and_paste: pixCode ?? null },
      identifier: (cashData as any)?.identifier,
    });
  } catch (err) {
    console.error("Unexpected error calling Sync", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Do not leak internal error messages to the client.
    return errorJson("Unexpected error calling Sync", 500);
  }
});
