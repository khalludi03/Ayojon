import { Package, Plus, Settings, ShoppingCart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add Product',
      icon: Plus,
      description: 'List a new product',
      variant: 'default' as const,
      onClick: () => navigate({ to: '/vendor/products' }),
    },
    {
      label: 'View Orders',
      icon: ShoppingCart,
      description: 'Manage your orders',
      variant: 'outline' as const,
      onClick: () => navigate({ to: '/vendor/orders' }),
    },
    {
      label: 'Manage Inventory',
      icon: Package,
      description: 'Update stock levels',
      variant: 'outline' as const,
      onClick: () => navigate({ to: '/vendor/products' }),
    },
    {
      label: 'Update Store',
      icon: Settings,
      description: 'Edit store settings',
      variant: 'outline' as const,
      onClick: () => navigate({ to: '/vendor/settings' }),
    },
  ]

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        Quick Actions
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{action.label}</span>
              </div>
              <span className="text-xs font-normal opacity-70">
                {action.description}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
