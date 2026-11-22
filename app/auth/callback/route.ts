import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mia-assistant-phi.vercel.app";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/setup", APP_URL));

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?auth=missing_code", APP_URL));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase email confirmation callback failed:", error.message);
    return NextResponse.redirect(new URL("/login?auth=confirmation_failed", APP_URL));
  }

  return NextResponse.redirect(new URL("/workspace", APP_URL));
}
