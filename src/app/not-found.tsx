import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-muted">
        That route does not exist or the prompt id is invalid.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Home
      </Link>
    </div>
  );
}
