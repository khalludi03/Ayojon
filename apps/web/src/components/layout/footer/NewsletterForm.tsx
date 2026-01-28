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
    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white">
          Subscribe to Zynex for exclusive offers!
        </h3>
        <p className="mt-1 text-sm text-white/80">
          Get the latest deals and discounts delivered to your inbox.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-lg bg-white/10 px-6 py-3 text-white">
          <p className="font-medium">Thanks for subscribing!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-11 w-full rounded-lg border-0 bg-white pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="h-11 px-6"
            isLoading={isSubmitting}
          >
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
