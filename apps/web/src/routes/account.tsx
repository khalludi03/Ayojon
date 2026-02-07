import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import type { AccountSection } from "@/types";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountMobileNav } from "@/components/account/account-mobile-nav";
import { AccountOverview } from "@/components/account/account-overview";
import {
  AccountOrders,
  AccountWishlist,
  AccountAddresses,
  AccountProfile,
  AccountSettings,
} from "@/components/account/account-sections";
import { useWishlist } from "@/stores/wishlist-store";
import {
  getAccountStats,
  getRecentOrders,
} from "@/mock/services/account";

type AccountSearch = {
  section?: AccountSection;
};

export const Route = createFileRoute("/account")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AccountSearch => {
    return {
      section: (search.section as AccountSection) || "overview",
    };
  },
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

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { section = "overview" } = Route.useSearch();
  const navigate = useNavigate();
  const { itemCount } = useWishlist();

  const userName = session?.user.name || "User";
  const userImage = session?.user.image ?? undefined;
  const stats = { ...getAccountStats(), wishlistItems: itemCount };
  const recentOrders = getRecentOrders();

  const handleSectionChange = (newSection: AccountSection) => {
    navigate({
      to: "/account",
      search: { section: newSection },
    });
  };

  const renderSection = () => {
    switch (section) {
      case "orders":
        return <AccountOrders />;
      case "wishlist":
        return <AccountWishlist />;
      case "addresses":
        return <AccountAddresses />;
      case "profile":
        return <AccountProfile session={session} />;
      case "settings":
        return <AccountSettings session={session} />;
      case "overview":
      default:
        return (
          <AccountOverview
            userName={userName}
            userImage={userImage}
            stats={stats}
            recentOrders={recentOrders}
          />
        );
    }
  };

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
          onSectionChange={handleSectionChange}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <AccountSidebar activeSection={section} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
