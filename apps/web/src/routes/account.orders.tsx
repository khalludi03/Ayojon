import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/orders')({
  component: () => <Outlet />,
})
