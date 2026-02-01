import { Link } from '@tanstack/react-router';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] sm:h-9 sm:w-9">
        <span className="text-base font-bold text-white sm:text-lg">A</span>
      </div>
      <span className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
        <span className="text-[hsl(var(--primary))]">Ayojon</span>
      </span>
    </Link>
  );
}
