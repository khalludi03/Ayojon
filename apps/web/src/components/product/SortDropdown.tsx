import { ArrowUpDown } from 'lucide-react'
import type { SortOption } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSort } from '@/stores/filter-store'
import { SORT_OPTIONS } from '@/types'
import { cn } from '@/lib/utils'

interface SortDropdownProps {
  className?: string
}

export function SortDropdown({ className }: SortDropdownProps) {
  const { sort, setSort } = useSort()

  // Get the current label for display
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === sort)?.label || 'Relevance'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
        Sort:
      </span>
      <Select
        value={sort}
        onValueChange={(value) => setSort(value as SortOption)}
      >
        <SelectTrigger className="h-9 w-full sm:w-auto gap-1 px-3 text-xs transition-all duration-200 rounded-xl">
          <ArrowUpDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
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
  )
}

export default SortDropdown
