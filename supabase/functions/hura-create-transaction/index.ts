/* eslint-disable no-console */
// Lovable Cloud backend function: Create PIX transaction in Hura Payments.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CreatePixRequest = {
  amount: number; // cents
  metadata?: Record<string, unknown>;
  postback_url?: string;
  customer?: {
    name?: string;
    phone?: string;
    document?: {
      type?: string;
      number?: string;
    };
  };
  items?: Array<{
    name: string;
    unit_amount: number; // cents
    quantity: number;
    metadata?: Record<string, unknown>;
  }>;
  shipping?: Record<string, unknown>;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorJson(message: string, status = 400, details?: unknown) {
  return json({ success: false, error: message, details }, status);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorJson("Method not allowed", 405);
  }

  const HURA_PUBLIC_KEY = Deno.env.get("HURA_PUBLIC_KEY");
  if (!HURA_PUBLIC_KEY) return errorJson("HURA_PUBLIC_KEY is not configured", 500);

  const HURA_SECRET_KEY = Deno.env.get("HURA_SECRET_KEY");
  if (!HURA_SECRET_KEY) return errorJson("HURA_SECRET_KEY is not configured", 500);

  const DEFAULT_POSTBACK_URL = Deno.env.get("HURA_POSTBACK_URL") || "";

  let payload: CreatePixRequest;
  try {
    payload = (await req.json()) as CreatePixRequest;
  } catch {
    return errorJson("Invalid JSON body", 400);
  }

  if (!Number.isInteger(payload.amount) || payload.amount <= 0) {
    return errorJson("amount must be a positive integer (cents)", 400);
  }

  const postback_url = payload.postback_url || DEFAULT_POSTBACK_URL;
  if (!postback_url) {
    return errorJson(
      "postback_url is required (provide in request or set HURA_POSTBACK_URL secret)",
      400,
    );
  }

  const auth = btoa(`${HURA_PUBLIC_KEY}:${HURA_SECRET_KEY}`);

  const body = {
    payment_method: "pix",
    amount: payload.amount,
    postback_url,
    customer: {
      name: payload.customer?.name,
      phone: payload.customer?.phone,
      // We are intentionally trying without CPF per current product decision.
      // If Hura requires it, the API will respond with 400 validation error.
      document: payload.customer?.document,
    },
    items: payload.items,
    shipping: payload.shipping,
    metadata: payload.metadata ?? {},
    ip: req.headers.get("x-forwarded-for") || undefined,
  };

  try {
    const resp = await fetch("https://api.hurapayments.com.br/v1/payment-transaction/create", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // keep raw text
    }

    if (!resp.ok) {
      console.error("Hura create transaction failed", { status: resp.status, data });
      return errorJson(`Hura API call failed [${resp.status}]`, resp.status, data);
    }

    return json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error calling Hura", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorJson("Unexpected error calling Hura", 500, msg);
  }
});
