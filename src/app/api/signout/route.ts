import { NextResponse } from "next/server";
import { createClient_server } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = await createClient_server();
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
