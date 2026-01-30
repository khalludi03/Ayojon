// Professional Payment Method Icons with realistic brand SVGs
// These are simplified but accurate representations of payment brand logos

interface PaymentIconProps {
  className?: string;
}

// Visa Logo SVG
function VisaIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 50 16" className={className} aria-label="Visa">
      <path
        fill="#1A1F71"
        d="M19.13 15.09h-3.33l2.08-12.85h3.33l-2.08 12.85zM32.24 2.57c-.66-.26-1.69-.54-2.98-.54-3.29 0-5.61 1.75-5.63 4.25-.02 1.85 1.65 2.88 2.91 3.5 1.3.63 1.73 1.03 1.73 1.6-.01.86-1.04 1.26-2 1.26-1.33 0-2.04-.2-3.14-.68l-.43-.2-.47 2.9c.78.36 2.22.67 3.72.69 3.5 0 5.78-1.73 5.8-4.4.01-1.47-.87-2.58-2.79-3.5-1.16-.6-1.87-.99-1.87-1.6.01-.54.6-1.11 1.9-1.11 1.09-.02 1.87.23 2.48.49l.3.15.45-2.81zM37.55 10.17l1.33-3.6c-.02.03.27-.75.44-1.24l.23 1.12.77 3.72h-2.77zm4.11-7.93h-2.57c-.8 0-1.39.23-1.74 1.07l-4.94 11.78h3.49l.7-1.93h4.27l.4 1.93h3.08l-2.69-12.85zM14.37 2.24l-3.26 8.77-.35-1.78c-.6-2.05-2.49-4.27-4.6-5.38l2.98 11.22h3.52l5.24-12.83h-3.53z"
      />
      <path
        fill="#F9A533"
        d="M7.23 2.24H1.97l-.05.3c4.17 1.07 6.93 3.64 8.08 6.73l-1.16-5.92c-.2-.82-.79-1.06-1.61-1.11z"
      />
    </svg>
  );
}

// Mastercard Logo SVG
function MastercardIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 50 30" className={className} aria-label="Mastercard">
      <circle cx="15" cy="15" r="15" fill="#EB001B" />
      <circle cx="35" cy="15" r="15" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M25 4.35c-4.14 3.24-6.8 8.26-6.8 13.93s2.66 10.7 6.8 13.94c4.14-3.24 6.8-8.27 6.8-13.94S29.14 7.6 25 4.35z"
      />
    </svg>
  );
}

// bKash Logo SVG - Authentic style with "b" icon
function BkashIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 80 32" className={className} aria-label="bKash">
      <defs>
        <linearGradient id="bkash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2136E" />
          <stop offset="100%" stopColor="#C4105D" />
        </linearGradient>
      </defs>
      <rect width="80" height="32" rx="4" fill="url(#bkash-gradient)" />
      {/* Stylized "b" logo mark */}
      <circle cx="16" cy="16" r="10" fill="white" />
      <path
        d="M13 10v12M13 16c0-2.5 2-4 4-4s4 1.5 4 4-2 4-4 4"
        stroke="#E2136E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* "Kash" text */}
      <text
        x="52"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        Kash
      </text>
    </svg>
  );
}

// Nagad Logo SVG - Authentic style with bird/wing icon
function NagadIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 80 32" className={className} aria-label="Nagad">
      <defs>
        <linearGradient id="nagad-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6921E" />
          <stop offset="100%" stopColor="#ED1C24" />
        </linearGradient>
      </defs>
      <rect width="80" height="32" rx="4" fill="url(#nagad-gradient)" />
      {/* Stylized bird/wing icon */}
      <g transform="translate(8, 6)">
        <path
          d="M4 14 Q8 6 16 10 Q12 4 6 8 Q10 2 18 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="16" cy="8" r="2" fill="white" />
      </g>
      {/* "nagad" text */}
      <text
        x="52"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        nagad
      </text>
    </svg>
  );
}

// Rocket Logo SVG
function RocketIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 50 20" className={className} aria-label="Rocket">
      <rect width="50" height="20" rx="3" fill="#8B2B8B" />
      <text
        x="25"
        y="14"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Rocket
      </text>
    </svg>
  );
}

// American Express Logo SVG - Authentic centurion style
function AmexIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-label="American Express">
      <rect width="60" height="40" rx="4" fill="#006FCF" />
      {/* Centurion head silhouette (simplified) */}
      <g transform="translate(6, 8)">
        <ellipse cx="8" cy="10" rx="6" ry="8" fill="#FFFFFF" opacity="0.9" />
        <path
          d="M2 6 Q8 0 14 6"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="5" y="18" width="6" height="6" fill="#FFFFFF" opacity="0.9" />
      </g>
      {/* AMEX text */}
      <text
        x="40"
        y="18"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
      >
        AMEX
      </text>
      <text
        x="40"
        y="28"
        textAnchor="middle"
        fill="white"
        fontSize="5"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}

// Cash on Delivery Icon - Modern style with package/money icon
function CodIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 70 40" className={className} aria-label="Cash on Delivery">
      <defs>
        <linearGradient id="cod-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <rect width="70" height="40" rx="4" fill="url(#cod-gradient)" />
      {/* Package box icon */}
      <g transform="translate(8, 8)">
        <rect x="0" y="6" width="16" height="14" rx="1" fill="white" stroke="#2E7D32" strokeWidth="0.5" />
        <path d="M0 10 L8 6 L16 10" stroke="#2E7D32" strokeWidth="1" fill="none" />
        <line x1="8" y1="6" x2="8" y2="20" stroke="#2E7D32" strokeWidth="0.8" />
        {/* Money/coin indicator */}
        <circle cx="14" cy="18" r="5" fill="#FFC107" stroke="#FF9800" strokeWidth="0.5" />
        <text x="14" y="20" textAnchor="middle" fill="#2E7D32" fontSize="5" fontWeight="bold">৳</text>
      </g>
      {/* COD text */}
      <text
        x="48"
        y="18"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
      >
        COD
      </text>
      <text
        x="48"
        y="28"
        textAnchor="middle"
        fill="rgba(255,255,255,0.9)"
        fontSize="5"
        fontWeight="500"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Cash on Delivery
      </text>
    </svg>
  );
}

// Payment methods configuration - bKash, Nagad, Visa, Mastercard, Cash on Delivery
const paymentMethods = [
  { name: 'bKash', Icon: BkashIcon, width: 'w-16' },
  { name: 'Nagad', Icon: NagadIcon, width: 'w-16' },
  { name: 'Visa', Icon: VisaIcon, width: 'w-14' },
  { name: 'Mastercard', Icon: MastercardIcon, width: 'w-11' },
  { name: 'Cash on Delivery', Icon: CodIcon, width: 'w-16' },
];

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">We accept:</span>
      <div className="flex flex-wrap items-center gap-2">
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className="group flex h-10 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-white px-2 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 dark:bg-gray-100"
            title={method.name}
          >
            <method.Icon className={`${method.width} h-7`} />
          </div>
        ))}
      </div>
    </div>
  );
}
