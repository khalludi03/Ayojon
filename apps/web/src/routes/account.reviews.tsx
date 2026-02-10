import { createFileRoute } from "@tanstack/react-router";
import { AccountReviews } from "@/components/account/account-sections";

export const Route = createFileRoute("/account/reviews")({
  component: AccountReviews,
});
