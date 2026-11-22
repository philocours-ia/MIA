import { NextResponse } from "next/server";

export function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return NextResponse.json({
    app: "MIA",
    status: "ok",
    integrations: {
      supabase: supabaseConfigured ? "configured" : "pending",
      ai: process.env.AI_GATEWAY_API_KEY || process.env.VERCEL ? "available" : "pending",
      model: process.env.MIA_MODEL || "google/gemini-3.1-flash"
    }
  });
}
