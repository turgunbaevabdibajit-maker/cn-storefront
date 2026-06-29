import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 mt-auto">
      <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} ChineseMaster. All rights reserved.
        </p>
        <p className="mt-1">
          Learning Chinese made simple. Courses for every level.
        </p>
      </div>
    </footer>
  );
}
