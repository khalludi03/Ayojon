import { NewsletterForm } from './NewsletterForm';
import { TrustBadges } from './TrustBadges';
import { FooterLinks } from './FooterLinks';
import { SocialIcons } from './SocialIcons';
import { PaymentIcons } from './PaymentIcons';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Newsletter Section */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <NewsletterForm />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <TrustBadges />
        </div>
      </div>

      {/* Links Section */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <FooterLinks />
        </div>
      </div>

      {/* Social & Contact */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-[hsl(var(--foreground))] sm:text-base">Contact Us</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                Customer Hotline: 16XXX (9 AM - 8 PM, Sat-Thu)
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                Email: support@ayojon.com
              </p>
            </div>
            <SocialIcons />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
              © 2026 Ayojon. All rights reserved.
            </p>
            <PaymentIcons />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
