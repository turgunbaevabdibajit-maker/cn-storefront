"use server";

import { createClient_server } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createClient_server();
  await supabase.auth.signOut();
}
