import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { Order } from '@/types'
import { AccountOverview } from '@/components/account/account-overview'
import { useWishlist } from '@/stores/wishlist-store'
import { orpc } from '@/utils/orpc'

export const Route = createFileRoute('/account/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      section: (search.section as string | undefined) || undefined,
    }
  },
  loader: (args) => {
    const search = args.search as any
    if (search?.section && search.section !== 'overview') {
      const path =
        search.section === 'profile'
          ? '/account/profile'
          : search.section === 'orders'
            ? '/account/orders'
            : search.section === 'wishlist'
              ? '/account/wishlist'
              : search.section === 'addresses'
                ? '/account/addresses'
                : search.section === 'settings'
                  ? '/account/settings'
                  : search.section === 'reviews'
                    ? '/account/reviews'
                    : null

      if (path) {
        throw redirect({ to: path })
      }
    }
  },
  component: OverviewComponent,
})

function OverviewComponent() {
  const { session } = Route.useRouteContext() as any
  const { itemCount: wishlistCount } = useWishlist()

  // Fetch real orders from backend
  const { data: orders = [], isLoading } = useQuery(
    orpc.order.listMyOrders.queryOptions(),
  )

  const userName = session?.user.name || 'User'
  const userImage = session?.user.image ?? undefined

  // Transform backend orders to frontend Order type for AccountOverview
  const recentOrders: Array<Order> = orders.slice(0, 3).map((order: any) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    total: parseFloat(order.total),
    status: order.status,
    items: order.items?.length || 0,
    imageUrl: order.items?.[0]?.imageUrl || undefined,
    createdAt: order.createdAt, // Needed for date display in component
  }))

  const stats = {
    totalOrders: orders.length,
    wishlistItems: wishlistCount,
  }

  return (
    <AccountOverview
      userName={userName}
      userImage={userImage}
      stats={stats}
      recentOrders={recentOrders}
      isLoading={isLoading}
    />
  )
}
