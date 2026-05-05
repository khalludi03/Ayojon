import { createFileRoute } from '@tanstack/react-router'
import { AccountWishlist } from '@/components/account/account-sections'

export const Route = createFileRoute('/account/wishlist')({
  component: AccountWishlist,
})
