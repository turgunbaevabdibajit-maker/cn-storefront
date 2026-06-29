import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient_middleware } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const supabase = await createClient_middleware();

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
