import { Link } from '@tanstack/react-router'

const linkGroups = [
  {
    title: 'About Us',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/return-policy', label: 'Return Policy' },
    ],
  },
  {
    title: 'Vendor',
    links: [
      { href: '/become-vendor', label: 'Become a Vendor' },
      { href: '/vendor/how-to-rent', label: 'How to Rent' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
      { href: '/hot-deals', label: 'Hot Deals' },
      { href: '/flash-deals', label: 'Flash Deals' },
      { href: '/events', label: 'Events' },
    ],
  },
]

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
      {linkGroups.map((group) => (
        <div key={group.title}>
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] sm:text-base">
            {group.title}
          </h4>
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
  )
}
