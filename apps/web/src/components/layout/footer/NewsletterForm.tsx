import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center sm:gap-4 md:flex-row md:text-left">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white sm:text-xl">
          Subscribe to Ayojon for exclusive offers!
        </h3>
        <p className="mt-1 text-xs text-white/80 sm:text-sm">
          Get event deals and vendor updates delivered to your inbox.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-lg bg-white/10 px-4 py-2 text-white sm:px-6 sm:py-3">
          <p className="text-sm font-medium sm:text-base">Thanks for subscribing!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))] sm:h-4 sm:w-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-10 w-full rounded-lg border-0 bg-white pl-9 pr-3 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-white/50 sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
              required
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="h-10 px-4 text-sm sm:h-11 sm:px-6"
            isLoading={isSubmitting}
          >
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
