import { createFileRoute } from '@tanstack/react-router'
import { VendorRegistration } from '@/components/vendor/VendorRegistration'

export const Route = createFileRoute('/become-vendor')({
  component: BecomeVendorPage,
})

function BecomeVendorPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <VendorRegistration />
    </div>
  )
}

export default BecomeVendorPage
