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

export function SortDropdown() {
  const { sort, setSort } = useSort();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">Sort by:</span>
      <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SortDropdown;
