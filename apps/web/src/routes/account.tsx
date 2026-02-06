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

  const userName = session?.user.name || "User";
  const userImage = session?.user.image ?? undefined;
  const stats = getAccountStats();
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
        return <AccountSettings />;
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
    <div className="container mx-auto px-4 py-8">
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
  );
}
