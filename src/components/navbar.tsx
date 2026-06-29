import Link from "next/link";
import { createClient_server } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/signout";

export default async function Navbar() {
  const supabase = await createClient_server();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-red-600 text-xl">中</span>
          <span>ChineseMaster</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="transition-colors hover:text-primary">
            Courses
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="transition-colors hover:text-primary">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-primary">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
