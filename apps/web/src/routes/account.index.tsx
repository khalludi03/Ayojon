import { createFileRoute } from "@tanstack/react-router";
import { AccountOverview } from "@/components/account/account-overview";
import { useWishlist } from "@/stores/wishlist-store";
import {
  getAccountStats,
  getRecentOrders,
} from "@/mock/services/account";

export const Route = createFileRoute("/account/")({
  component: OverviewComponent,
});

function OverviewComponent() {
  const { session } = Route.useRouteContext() as any;
  const { itemCount } = useWishlist();

  const userName = session?.user.name || "User";
  const userImage = session?.user.image ?? undefined;
  const stats = { ...getAccountStats(), wishlistItems: itemCount };
  const recentOrders = getRecentOrders();

  return (
    <AccountOverview
      userName={userName}
      userImage={userImage}
      stats={stats}
      recentOrders={recentOrders}
    />
  );
}
