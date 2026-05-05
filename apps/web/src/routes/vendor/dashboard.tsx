import { createFileRoute, redirect } from '@tanstack/react-router'
import { VendorDashboard } from '@/components/vendor/dashboard/VendorDashboard'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/vendor/dashboard')({
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    const user = session.user as any
    if (user.role !== 'vendor' || user.vendorStatus !== 'approved') {
      throw redirect({ to: '/' })
    }
    return { session }
  },
  component: VendorDashboardPage,
})

function VendorDashboardPage() {
  return <VendorDashboard />
}

export default VendorDashboardPage
