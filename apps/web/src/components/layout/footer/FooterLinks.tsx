import { Link } from '@tanstack/react-router';

const linkGroups = [
  {
    title: 'About Us',
    links: [
      { href: '/about', label: 'About Ayojon' },
      { href: '/careers', label: 'Careers' },
      { href: '/press', label: 'Press' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Shop By',
    links: [
      { href: '/categories', label: 'All Categories' },
      { href: '/new-arrivals', label: 'New Arrivals' },
      { href: '/best-sellers', label: 'Best Sellers' },
      { href: '/deals', label: 'Deals' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { href: '/contact', label: 'Contact Us' },
      { href: '/faq', label: 'FAQ' },
      { href: '/track-order', label: 'Track Order' },
      { href: '/return-policy', label: 'Return Policy' },
      { href: '/shipping', label: 'Shipping Info' },
    ],
  },
  {
    title: 'Sell on Ayojon',
    links: [
      { href: '/seller/register', label: 'Become a Seller' },
      { href: '/seller/login', label: 'Seller Login' },
      { href: '/seller/guidelines', label: 'Seller Guidelines' },
      { href: '/seller/support', label: 'Seller Support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
];

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-5">
      {linkGroups.map((group) => (
        <div key={group.title}>
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] sm:text-base">{group.title}</h4>
          <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))] sm:text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
