import { createFileRoute } from '@tanstack/react-router'
import { AccountAddresses } from '@/components/account/account-sections'

export const Route = createFileRoute('/account/addresses')({
  component: AccountAddresses,
})
