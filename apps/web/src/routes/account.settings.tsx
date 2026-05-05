import { createFileRoute } from '@tanstack/react-router'
import { AccountSettings } from '@/components/account/account-sections'

export const Route = createFileRoute('/account/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  const { session } = Route.useRouteContext() as any
  return <AccountSettings session={session} />
}
