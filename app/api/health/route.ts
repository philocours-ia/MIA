import { NextResponse } from "next/server";

export function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const provider = (process.env.MIA_PROVIDER || "openai").toLowerCase();
  const aiConfigured =
    provider === "openai" ? Boolean(process.env.OPENAI_API_KEY) :
    provider === "anthropic" ? Boolean(process.env.ANTHROPIC_API_KEY) :
    false;

  return NextResponse.json({
    app: "OMNIA",
    status: "ok",
    integrations: {
      supabase: supabaseConfigured ? "configured" : "pending",
      ai: aiConfigured ? "configured" : "pending"
    },
    provider: provider === "openai" || provider === "anthropic" ? provider : "invalid",
    model: process.env.MIA_MODEL || "provider-default"
  });
}