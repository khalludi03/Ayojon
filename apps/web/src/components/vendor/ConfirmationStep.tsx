import { ArrowRight, CheckCircle2, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationStepProps {
  applicationId: string
  email: string
  onBackToHome: () => void
}

export function ConfirmationStep({
  applicationId,
  email,
  onBackToHome,
}: ConfirmationStepProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
          Application Submitted!
        </h2>

        {/* Description */}
        <p className="text-[hsl(var(--muted-foreground))] mb-8">
          We'll review your application within 2-3 business days
        </p>

        {/* Application Details */}
        <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-6 mb-8 text-left">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Application ID
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
                  {applicationId}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-2">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Email Confirmation
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  A confirmation email has been sent to{' '}
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {email}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-2">
                <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Status: Pending Review
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  You'll receive an email notification once your application is
                  reviewed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 mb-8 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300 text-left">
            <p className="font-semibold mb-2">What happens next?</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Our team will review your application and documents</li>
              <li>
                You'll receive an email with the decision (approved/rejected)
              </li>
              <li>If approved, you can access your vendor dashboard</li>
              <li>Start listing your products and begin selling!</li>
            </ol>
          </div>
        </div>

        {/* Note */}
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
          You cannot access the vendor dashboard until your application is
          approved.
        </p>

        {/* Action Button */}
        <Button size="lg" onClick={onBackToHome} className="min-w-[200px]">
          Back to Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
