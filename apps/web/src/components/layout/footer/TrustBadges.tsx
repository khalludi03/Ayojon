// Custom SVG icons for professional e-commerce look
function CashOnDeliveryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand */}
      <path d="M12 32C12 32 14 28 20 28H28C30 28 32 30 32 32V36H12V32Z" fill="currentColor" opacity="0.2"/>
      <path d="M8 36H36V40C36 41.1 35.1 42 34 42H10C8.9 42 8 41.1 8 40V36Z" fill="currentColor" opacity="0.3"/>
      {/* Money/Bills */}
      <rect x="16" y="8" width="20" height="12" rx="2" fill="currentColor" opacity="0.15"/>
      <rect x="18" y="10" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="26" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <text x="25" y="15.5" fontSize="4" fontWeight="bold" fill="currentColor" textAnchor="middle">৳</text>
      {/* Coins */}
      <circle cx="12" y="18" r="5" fill="currentColor" opacity="0.25"/>
      <circle cx="12" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <text x="12" y="20" fontSize="5" fontWeight="bold" fill="currentColor" textAnchor="middle">৳</text>
      {/* Hand outline */}
      <path d="M10 34C10 34 12 30 18 30H30C33 30 36 32 36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M6 38H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function NationwideDeliveryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Truck body */}
      <rect x="4" y="20" width="26" height="16" rx="2" fill="currentColor" opacity="0.15"/>
      <rect x="4" y="20" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Truck cabin */}
      <path d="M30 24H38C40 24 42 26 43 28L44 32V36H30V24Z" fill="currentColor" opacity="0.2"/>
      <path d="M30 24H38C40 24 42 26 43 28L44 32V36H30V24Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Window */}
      <rect x="33" y="26" width="7" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      {/* Wheels */}
      <circle cx="12" cy="36" r="5" fill="currentColor" opacity="0.2"/>
      <circle cx="12" cy="36" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="36" r="1.5" fill="currentColor"/>
      <circle cx="38" cy="36" r="5" fill="currentColor" opacity="0.2"/>
      <circle cx="38" cy="36" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="38" cy="36" r="1.5" fill="currentColor"/>
      {/* Package inside */}
      <rect x="10" y="24" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/>
      <path d="M14 24V32M10 28H18" stroke="currentColor" strokeWidth="1"/>
      {/* Motion lines */}
      <path d="M2 28H4M2 32H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Location pin */}
      <path d="M22 8C22 8 26 4 26 8C26 10 24 14 24 14C24 14 22 10 22 8Z" fill="currentColor" opacity="0.3"/>
      <circle cx="24" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function EasyReturnsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box */}
      <rect x="12" y="16" width="24" height="20" rx="2" fill="currentColor" opacity="0.15"/>
      <rect x="12" y="16" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Box flaps */}
      <path d="M12 16L18 10H30L36 16" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M24 10V16" stroke="currentColor" strokeWidth="2"/>
      {/* Box tape */}
      <rect x="20" y="16" width="8" height="20" fill="currentColor" opacity="0.1"/>
      <path d="M20 16V36M28 16V36" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      {/* Return arrow */}
      <path d="M6 26C6 20 10 14 18 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M14 10L18 14L14 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Checkmark */}
      <circle cx="38" cy="32" r="7" fill="hsl(var(--primary))" opacity="0.2"/>
      <circle cx="38" cy="32" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M34 32L37 35L42 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SecurePaymentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M24 4L8 10V22C8 32 15 40 24 44C33 40 40 32 40 22V10L24 4Z" fill="currentColor" opacity="0.1"/>
      <path d="M24 4L8 10V22C8 32 15 40 24 44C33 40 40 32 40 22V10L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Lock body */}
      <rect x="18" y="22" width="12" height="10" rx="2" fill="currentColor" opacity="0.2"/>
      <rect x="18" y="22" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      {/* Lock shackle */}
      <path d="M20 22V18C20 15.8 21.8 14 24 14C26.2 14 28 15.8 28 18V22" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Keyhole */}
      <circle cx="24" cy="26" r="1.5" fill="currentColor"/>
      <rect x="23" y="26" width="2" height="3" fill="currentColor"/>
      {/* SSL badge */}
      <circle cx="38" cy="10" r="6" fill="hsl(var(--primary))" opacity="0.3"/>
      <text x="38" y="12" fontSize="6" fontWeight="bold" fill="currentColor" textAnchor="middle">SSL</text>
      {/* Checkmark on shield */}
      <path d="M16 38L20 42L28 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    </svg>
  );
}

const badges = [
  {
    Icon: CashOnDeliveryIcon,
    title: 'Cash on Delivery',
    description: 'Pay at your doorstep',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    Icon: NationwideDeliveryIcon,
    title: 'Nationwide Delivery',
    description: 'Delivery all over Bangladesh',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    Icon: EasyReturnsIcon,
    title: 'Easy Returns',
    description: '7-day return policy',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    Icon: SecurePaymentsIcon,
    title: 'Secure Payments',
    description: 'SSL encrypted transactions',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="group flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:shadow-md transition-all duration-300 sm:gap-3 sm:p-4 md:flex-row md:text-left"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${badge.bgColor} group-hover:scale-110 transition-transform duration-300 sm:h-14 sm:w-14`}>
            <badge.Icon className={`h-7 w-7 ${badge.color} sm:h-8 sm:w-8`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[hsl(var(--foreground))] sm:text-sm">{badge.title}</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 sm:text-xs">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
