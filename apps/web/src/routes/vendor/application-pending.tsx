import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/vendor/application-pending' as any)({
  component: ApplicationPendingPage,
})

function ApplicationPendingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Clock className="h-10 w-10" />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
        Application Under Review
      </h1>

      <p className="mb-8 max-w-md text-[hsl(var(--muted-foreground))]">
        Thank you for applying to be a vendor! Our team is currently reviewing
        your application. This process usually takes 2-3 business days.
      </p>

      <div className="mb-8 w-full max-w-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-left">
        <h3 className="mb-4 font-semibold text-[hsl(var(--card-foreground))]">
          What happens next?
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              1
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Our team verifies your business documents and store details.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
              2
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              You'll receive an email notification once a decision is made.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              3
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              If approved, you'll gain access to your vendor dashboard.
            </p>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="ghost" className="text-[hsl(var(--primary))]">
          <Mail className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </div>
    </div>
  )
}
