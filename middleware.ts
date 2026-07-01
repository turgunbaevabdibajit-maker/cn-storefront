import { type NextRequest } from "next/server";
import { createClient_middleware } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient_middleware();

  // Refresh session if expired — required for Server Components
  await supabase.auth.getSession();

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - static files (_next/static, images, favicon, etc.)
     * - API routes
     * - _next/image optimization
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
