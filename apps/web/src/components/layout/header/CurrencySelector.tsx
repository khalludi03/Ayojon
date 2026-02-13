import type { CurrencyCode } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency } from '@/stores/currency-store'

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency()

  return (
    <Select
      value={currency}
      onValueChange={(value) => setCurrency(value as CurrencyCode)}
    >
      <SelectTrigger className="w-24 border-none bg-transparent focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableCurrencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <span className="flex items-center gap-2">
              <span>{curr.symbol}</span>
              <span>{curr.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
