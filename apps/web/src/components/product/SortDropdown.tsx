import type {SortOption} from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSort } from '@/stores/filter-store';
import { SORT_OPTIONS  } from '@/types';
import { ArrowUpDown } from 'lucide-react';

export function SortDropdown() {
  const { sort, setSort } = useSort();

  // Get the current label for display
  const currentLabel = SORT_OPTIONS.find((opt) => opt.value === sort)?.label || 'Relevance';

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[hsl(var(--muted-foreground))]">Sort:</span>
      <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
        <SelectTrigger className="h-8 w-auto gap-1 px-2 text-xs transition-all duration-200">
          <ArrowUpDown className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          <SelectValue placeholder={currentLabel} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="cursor-pointer text-xs transition-colors"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SortDropdown;
