import { Link } from '@tanstack/react-router';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
        <span className="text-lg font-bold text-white">A</span>
      </div>
      <span className="text-xl font-bold text-[hsl(var(--foreground))]">
        <span className="text-[hsl(var(--primary))]">Ayojon</span>
      </span>
    </Link>
  );
}
