import { createFileRoute, Link } from '@tanstack/react-router';
import { XCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/vendor/application-rejected' as any)({
  component: ApplicationRejectedPage,
});

function ApplicationRejectedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <XCircle className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
        Application Declined
      </h1>
      
      <p className="mb-8 max-w-md text-[hsl(var(--muted-foreground))]">
        We regret to inform you that your vendor application has been declined at this time. 
        Please check your email for more details regarding this decision.
      </p>

      <div className="mb-8 w-full max-w-sm rounded-lg border border-red-100 bg-red-50 p-6 text-left">
        <h3 className="mb-2 font-semibold text-red-900">Possible Reasons:</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-red-800">
          <li>Incomplete or invalid documents</li>
          <li>Store details do not meet our guidelines</li>
          <li>Business information could not be verified</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild>
          <Link to="/become-vendor">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reapply
          </Link>
        </Button>
      </div>
      
      <p className="mt-8 text-sm text-[hsl(var(--muted-foreground))]">
        Have questions? <button className="font-medium text-[hsl(var(--primary))] hover:underline">Contact our support team</button>
      </p>
    </div>
  );
}
