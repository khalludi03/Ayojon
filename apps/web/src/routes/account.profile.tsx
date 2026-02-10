import { createFileRoute } from "@tanstack/react-router";
import { AccountProfile } from "@/components/account/account-sections";

export const Route = createFileRoute("/account/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const { session } = Route.useRouteContext() as any;
  return <AccountProfile session={session} />;
}
