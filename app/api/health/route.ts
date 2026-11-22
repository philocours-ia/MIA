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
      ai: process.env.AI_API_KEY ? "configured" : "pending"
    }
  });
}