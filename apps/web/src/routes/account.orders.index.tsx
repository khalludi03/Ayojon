import { createFileRoute } from '@tanstack/react-router'
import { AccountOrders } from '@/components/account/account-sections'

export const Route = createFileRoute('/account/orders/')({
  component: AccountOrders,
})
