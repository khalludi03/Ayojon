import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import type { AccountSection } from "@/types";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountMobileNav } from "@/components/account/account-mobile-nav";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function AccountLayout() {
  const { pathname } = useLocation();
  
  // Determine active section from pathname
  const getActiveSection = (): AccountSection => {
    if (pathname.includes("/account/orders")) return "orders";
    if (pathname.includes("/account/wishlist")) return "wishlist";
    if (pathname.includes("/account/addresses")) return "addresses";
    if (pathname.includes("/account/profile")) return "profile";
    if (pathname.includes("/account/settings")) return "settings";
    return "overview";
  };

  const section = getActiveSection();

  return (
    <div className="account-shell relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(244,78,55,0.25),transparent_60%)]" />
        <div className="absolute right-0 top-36 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(51,163,153,0.22),transparent_60%)]" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(251,171,27,0.18),transparent_60%)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6 rounded-2xl border border-[hsl(var(--border))] bg-[linear-gradient(135deg,rgba(244,78,55,0.08),rgba(51,163,153,0.08))] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Account</p>
          <h1 className="account-heading mt-2 text-2xl font-semibold text-[hsl(var(--foreground))] sm:text-3xl">
            Your account, at a glance
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Track orders, manage profile details, and keep your wishlist close.
          </p>
        </div>

        <AccountMobileNav
          activeSection={section}
          onSectionChange={() => {}} // Mobile nav will use Links now
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <AccountSidebar activeSection={section} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}