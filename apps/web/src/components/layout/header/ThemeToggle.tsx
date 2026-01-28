import { Moon, Sun } from 'lucide-react';
import type {Theme} from '@/stores/theme-store';
import {  useTheme } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: Array<{ value: Theme; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  ];

  return (
    <div className="flex items-center rounded-full bg-[hsl(var(--muted))] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            'rounded-full p-2 transition-colors',
            theme === option.value
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          )}
          aria-label={`Set ${option.label} theme`}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
