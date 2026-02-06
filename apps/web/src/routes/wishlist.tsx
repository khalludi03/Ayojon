import { createFileRoute } from "@tanstack/react-router";
import { WishlistPage } from "@/components/wishlist/wishlist-page";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});
