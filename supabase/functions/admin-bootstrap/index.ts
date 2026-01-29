/* eslint-disable no-console */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "npm:@supabase/supabase-js@2.93.2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorJson(message: string, status = 400) {
  return json({ success: false, error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("Method not allowed", 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL) return errorJson("SUPABASE_URL is not configured", 500);
  if (!SUPABASE_ANON_KEY) return errorJson("SUPABASE_ANON_KEY is not configured", 500);
  if (!SUPABASE_SERVICE_ROLE_KEY) return errorJson("SUPABASE_SERVICE_ROLE_KEY is not configured", 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return errorJson("Unauthorized", 401);
  const token = authHeader.slice("Bearer ".length);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) return errorJson("Unauthorized", 401);
  const userId = claimsData.claims.sub;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Enforce: only the FIRST admin can ever exist.
  const { count, error: cntErr } = await admin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (cntErr) {
    console.error("Failed to count admins", { code: cntErr.code });
    return errorJson("Failed to check admin state", 500);
  }

  if ((count ?? 0) > 0) {
    return json({ success: true, already_initialized: true });
  }

  // This insert is protected by a DB unique partial index (single admin).
  const { error: insErr } = await admin.from("user_roles").insert({
    user_id: userId,
    role: "admin",
  });

  if (insErr) {
    console.error("Failed to insert admin role", { code: insErr.code });
    return errorJson("Could not assign admin (maybe already initialized)", 409);
  }

  return json({ success: true, promoted: true });
});
