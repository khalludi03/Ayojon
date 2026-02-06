import { Link } from "@tanstack/react-router";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LayoutDashboard
} from "lucide-react";
import type { AccountSection } from "@/types";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  activeSection: AccountSection;
  className?: string;
}

const navigationItems = [
  { id: "overview" as AccountSection, label: "Overview", icon: LayoutDashboard },
  { id: "orders" as AccountSection, label: "Orders", icon: Package },
  { id: "wishlist" as AccountSection, label: "Wishlist", icon: Heart },
  { id: "addresses" as AccountSection, label: "Addresses", icon: MapPin },
  { id: "profile" as AccountSection, label: "Profile", icon: User },
  { id: "settings" as AccountSection, label: "Settings", icon: Settings },
];

export function AccountSidebar({ activeSection, className }: AccountSidebarProps) {
  return (
    <aside className={cn("w-full lg:w-64 space-y-3", className)}>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
          Navigation
        </p>
        <nav className="mt-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.id}
                to="/account"
                search={{ section: item.id }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
