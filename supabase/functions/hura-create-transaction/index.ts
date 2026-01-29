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
  shipping?: {
    // we accept a simple shape from the frontend and normalize it to what Hura expects
    cep?: string;
    address?: string;
    number?: string;
    method?: string;
    price?: number;
    [key: string]: unknown;
  };
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function digitsOnly(value: unknown): string | undefined {
  const s = asString(value);
  if (!s) return undefined;
  const d = s.replace(/\D+/g, "");
  return d || undefined;
}

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

  const shippingAddressText = asString(payload.shipping?.address);
  const shippingNumber = asString(payload.shipping?.number);
  const shippingCep = asString(payload.shipping?.cep);

  // Hura is returning validation errors indicating:
  // - a root `request` object is required
  // - `shipping.address` must be an object, not a string
  const normalizedShipping = {
    ...payload.shipping,
    address: shippingAddressText
      ? {
          street: shippingAddressText,
          number: shippingNumber,
          zipcode: shippingCep,
        }
      : payload.shipping?.address,
  };

  const customer = {
    name: payload.customer?.name,
    // Many payment APIs require phone without mask.
    phone: digitsOnly(payload.customer?.phone) ?? payload.customer?.phone,
    // We are intentionally trying without CPF per current product decision.
    // If Hura requires it, the API will respond with 400 validation error.
    document: payload.customer?.document,
  };
  const metadata = payload.metadata ?? {};
  const metadataJson = JSON.stringify(metadata);

  // Hura is clearly expecting a `request` wrapper. Their validation messages also
  // reference PascalCase fields (Metadata, Customer.Phone). To maximize
  // compatibility, we send both camelCase + PascalCase for the critical fields.
  const Customer = {
    Name: customer.name,
    Phone: customer.phone,
    Document: customer.document
      ? {
          Type: (customer.document as any)?.type,
          Number: (customer.document as any)?.number,
        }
      : undefined,
  };

  const rootIp = req.headers.get("x-forwarded-for") || undefined;

  const requestPayload = {
    payment_method: "pix",
    amount: payload.amount,
    postback_url,
    customer,
    Customer: {
      ...Customer,
      Phone: digitsOnly(Customer.Phone) ?? Customer.Phone,
    },
    items: payload.items,
    Items: payload.items,
    shipping: normalizedShipping,
    Shipping: normalizedShipping,
    metadata,
    Metadata: metadata,
    MetadataJson: metadataJson,
    ip: rootIp,
    Ip: rootIp,
  };

  const body = {
    request: requestPayload,
    Request: requestPayload,
  };

  console.log("Hura outbound payload shape", {
    has_request: !!(body as any).request,
    has_customer: !!(body as any).customer,
    customer_phone: (body as any).customer?.phone,
    has_Customer: !!(body as any).Customer,
    Customer_Phone: (body as any).Customer?.Phone,
    has_metadata: !!(body as any).metadata,
    metadata_keys: Object.keys((body as any).metadata ?? {}),
    has_Metadata: !!(body as any).Metadata,
    Metadata_keys: Object.keys((body as any).Metadata ?? {}),
    has_shipping: !!(body as any).shipping,
    shipping_address_type: typeof (body as any).shipping?.address,
    shipping_address_keys: Object.keys((body as any).shipping?.address ?? {}),
  });

  try {
    const callHura = async (url: string) => {
      return await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
      });
    };

    // Some docs show plural, others singular. We'll try plural first.
    let resp = await callHura("https://api.hurapayments.com.br/v1/payment-transactions/create");
    if (resp.status === 404) {
      await resp.text(); // consume
      resp = await callHura("https://api.hurapayments.com.br/v1/payment-transaction/create");
    }

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
