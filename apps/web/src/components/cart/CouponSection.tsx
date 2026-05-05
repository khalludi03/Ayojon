import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Tag,
  Ticket,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function CouponSection() {
  const { discount, applyCoupon, removeCoupon, discountAmount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setError('Please enter a coupon code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await applyCoupon(code)

      if (result.valid && result.coupon) {
        toast.success(result.coupon.message || 'Coupon applied successfully!')
        setCouponCode('')
        setIsOpen(false)
      } else {
        setError(result.error || 'Invalid coupon code')
      }
    } catch (e) {
      setError('Failed to validate coupon. Please try again.')
    }

    setIsLoading(false)
  }

  const handleRemove = () => {
    removeCoupon()
    toast.success('Coupon removed')
  }

  if (discount) {
    return (
      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-900 dark:text-emerald-100">
                    {discount.code}
                  </span>
                  <Badge
                    variant="freeShipping"
                    className="h-5 px-1.5 py-0 text-[10px] uppercase tracking-wider"
                  >
                    Applied
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  {discount.type === 'free_shipping'
                    ? 'Free Shipping Activated'
                    : `Discount of ${formatPrice(discountAmount)} applied to your order`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-1 -mt-1 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
              onClick={handleRemove}
              title="Remove coupon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Successfully applied</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-3 text-sm font-medium transition-all hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5',
          isOpen
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]'
            : 'text-[hsl(var(--muted-foreground))]',
        )}
      >
        <div className="flex items-center gap-2">
          <Tag className={cn('h-4 w-4', isOpen && 'animate-pulse')} />
          <span>Have a coupon or promo code?</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value)
                    if (error) setError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Enter code (e.g. SAVE10)"
                  className={cn(
                    'w-full rounded-lg border bg-[hsl(var(--background))] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20',
                    error
                      ? 'border-destructive ring-destructive/20'
                      : 'border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]',
                  )}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleApplyCoupon}
                disabled={isLoading || !couponCode.trim()}
                className="px-6 shadow-sm"
              >
                Apply
              </Button>
            </div>

            {error && (
              <div className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-destructive animate-in fade-in slide-in-from-left-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
