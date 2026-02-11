import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountOverview } from "@/components/account/account-overview";
import { useWishlist } from "@/stores/wishlist-store";
import {
  getAccountStats,
  getRecentOrders,
} from "@/mock/services/account";

export const Route = createFileRoute("/account/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      section: (search?.section as string | undefined) || undefined,
    };
  },
  loader: (args) => {
    const search = args?.search as any;
    if (search?.section && search.section !== "overview") {
      const path = search.section === "profile" ? "/account/profile" : 
                   search.section === "orders" ? "/account/orders" :
                   search.section === "wishlist" ? "/account/wishlist" :
                   search.section === "addresses" ? "/account/addresses" :
                   search.section === "settings" ? "/account/settings" :
                   search.section === "reviews" ? "/account/reviews" :
                   null;
      
      if (path) {
        throw redirect({ to: path });
      }
    }
  },
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