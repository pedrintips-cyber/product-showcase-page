/* eslint-disable no-console */
// Lovable Cloud backend function: Create PIX cash-in via Sync Payments.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "npm:@supabase/supabase-js@2.93.2";

type CashInRequest = {
  amount: number; // BRL
  description?: string;
  client: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  delivery?: {
    cep?: string;
    address?: string;
    number?: string;
  };
  order?: {
    product?: {
      name?: string;
      unitPrice?: number;
      color?: string;
      size?: string;
      qty?: number;
    };
    addTop?: boolean;
    shipping?: string;
    subtotal?: number;
    shippingPrice?: number;
    total?: number;
  };
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function digitsOnly(value: unknown): string {
  return (asString(value) ?? "").replace(/\D+/g, "");
}

function limit(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  return value.length > max ? value.slice(0, max) : value;
}

function toCsvValue(v: unknown) {
  const s = String(v ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${s}"`;
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
  const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SYNC_CLIENT_ID) return errorJson("SYNC_CLIENT_ID is not configured", 500);
  if (!SYNC_CLIENT_SECRET) return errorJson("SYNC_CLIENT_SECRET is not configured", 500);
  if (!SYNC_WEBHOOK_URL) return errorJson("SYNC_WEBHOOK_URL is not configured", 500);
  if (!DISCORD_WEBHOOK_URL) return errorJson("DISCORD_WEBHOOK_URL is not configured", 500);
  if (!SUPABASE_URL) return errorJson("SUPABASE_URL is not configured", 500);
  if (!SUPABASE_SERVICE_ROLE_KEY) return errorJson("SUPABASE_SERVICE_ROLE_KEY is not configured", 500);

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

  const cep = limit(digitsOnly(payload.delivery?.cep), 8);
  const address = limit(asString(payload.delivery?.address), 160);
  const number = limit(asString(payload.delivery?.number), 10);

  const productName = limit(asString(payload.order?.product?.name), 200) ?? "Produto";
  const productColor = limit(asString(payload.order?.product?.color), 40);
  const productSize = limit(asString(payload.order?.product?.size), 12);
  const qty = Number(payload.order?.product?.qty ?? 1);
  const addTop = Boolean(payload.order?.addTop);
  const shipping = limit(asString(payload.order?.shipping), 40) ?? "carrier";

  const subtotal = Number(payload.order?.subtotal ?? amount);
  const shippingPrice = Number(payload.order?.shippingPrice ?? 0);
  const total = Number(payload.order?.total ?? amount);

  if (!cep || cep.length !== 8) return errorJson("delivery.cep is invalid", 422);
  if (!address || address.length < 3) return errorJson("delivery.address is required", 422);
  if (!number) return errorJson("delivery.number is required", 422);
  if (!Number.isFinite(qty) || qty <= 0 || qty > 99) return errorJson("order.product.qty is invalid", 422);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return errorJson("order.subtotal is invalid", 422);
  if (!Number.isFinite(shippingPrice) || shippingPrice < 0) return errorJson("order.shippingPrice is invalid", 422);
  if (!Number.isFinite(total) || total <= 0) return errorJson("order.total is invalid", 422);

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

    const identifier = (cashData as any)?.identifier;

    // 3) Save lead securely in backend (service role bypasses RLS)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const leadInsert = {
      name,
      email,
      phone,
      cpf,
      cep,
      address,
      number,
      product_name: productName,
      product_color: productColor ?? null,
      product_size: productSize ?? null,
      qty,
      add_top: addTop,
      shipping,
      subtotal: Number(subtotal.toFixed(2)),
      shipping_price: Number(shippingPrice.toFixed(2)),
      total: Number(total.toFixed(2)),
      pix_identifier: typeof identifier === "string" ? identifier : null,
    };

    const { error: leadErr } = await admin.from("checkout_leads").insert(leadInsert);
    if (leadErr) {
      // Don't block payment flow if remarketing capture fails.
      console.error("Failed to insert checkout lead", { code: leadErr.code });
    }

    async function sendDiscordBatchIfNeeded() {
      try {
        const { count, error: cntErr } = await admin
          .from("checkout_leads")
          .select("id", { count: "exact", head: true })
          .eq("sent_to_discord", false);
        if (cntErr) throw cntErr;
        if (!count || count < 100) return;

        const { data: leads, error: leadsErr } = await admin
          .from("checkout_leads")
          .select(
            "id,created_at,name,email,phone,cpf,cep,address,number,product_name,product_color,product_size,qty,add_top,shipping,total,pix_identifier",
          )
          .eq("sent_to_discord", false)
          .order("created_at", { ascending: true })
          .limit(100);
        if (leadsErr) throw leadsErr;
        if (!leads || leads.length < 100) return;

        const batchId = crypto.randomUUID();
        const firstAt = leads[0]?.created_at ? new Date(leads[0].created_at).toISOString() : null;
        const lastAt = leads[leads.length - 1]?.created_at
          ? new Date(leads[leads.length - 1].created_at).toISOString()
          : null;

        const { error: batchErr } = await admin.from("discord_lead_batches").insert({
          id: batchId,
          lead_count: leads.length,
          first_lead_at: firstAt,
          last_lead_at: lastAt,
        });
        if (batchErr) throw batchErr;

        const header = [
          "created_at",
          "id",
          "name",
          "email",
          "phone",
          "cpf",
          "cep",
          "address",
          "number",
          "product_name",
          "product_color",
          "product_size",
          "qty",
          "add_top",
          "shipping",
          "total",
          "pix_identifier",
        ];

        const lines = [header.join(",")];
        for (const l of leads as any[]) {
          lines.push(
            [
              l.created_at,
              l.id,
              l.name,
              l.email,
              l.phone,
              l.cpf,
              l.cep,
              l.address,
              l.number,
              l.product_name,
              l.product_color ?? "",
              l.product_size ?? "",
              l.qty,
              l.add_top,
              l.shipping,
              l.total,
              l.pix_identifier ?? "",
            ].map(toCsvValue).join(","),
          );
        }

        const csv = lines.join("\n");
        const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const form = new FormData();
        form.append(
          "payload_json",
          JSON.stringify({
            content: `Lote de 100 checkouts (batch ${batchId}). Arquivo CSV em anexo.`,
          }),
        );
        form.append("files[0]", file, `leads-${batchId}.csv`);

        const discordResp = await fetch(DISCORD_WEBHOOK_URL!, {
          method: "POST",
          body: form,
        });
        const discordData = await safeJson(discordResp);
        if (!discordResp.ok) {
          console.error("Discord webhook failed", { status: discordResp.status });
          return;
        }

        const messageId = (discordData as any)?.id;
        await admin
          .from("discord_lead_batches")
          .update({ discord_message_id: typeof messageId === "string" ? messageId : null })
          .eq("id", batchId);

        const ids = (leads as any[]).map((l) => l.id);
        await admin
          .from("checkout_leads")
          .update({ sent_to_discord: true, discord_batch_id: batchId })
          .in("id", ids);
      } catch (e) {
        console.error("Discord batch job failed", e);
      }
    }

    // Run the Discord batching in background so it never blocks Pix creation.
    // @ts-ignore - EdgeRuntime is available in edge runtime.
    EdgeRuntime?.waitUntil?.(sendDiscordBatchIfNeeded());

    // Return only what the frontend needs.
    return json({
      success: true,
      pix: { copy_and_paste: pixCode ?? null },
      identifier,
    });
  } catch (err) {
    console.error("Unexpected error calling Sync", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Do not leak internal error messages to the client.
    return errorJson("Unexpected error calling Sync", 500);
  }
});
