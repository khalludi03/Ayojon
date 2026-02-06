import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { AccountSection } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountMobileNavProps {
  activeSection: AccountSection;
  onSectionChange: (section: AccountSection) => void;
}

const navigationItems = [
  { id: "overview" as AccountSection, label: "Overview" },
  { id: "orders" as AccountSection, label: "Orders" },
  { id: "wishlist" as AccountSection, label: "Wishlist" },
  { id: "addresses" as AccountSection, label: "Addresses" },
  { id: "profile" as AccountSection, label: "Profile" },
  { id: "settings" as AccountSection, label: "Settings" },
];

export function AccountMobileNav({ activeSection, onSectionChange }: AccountMobileNavProps) {
  const [open, setOpen] = useState(false);
  const activeItem = navigationItems.find((item) => item.id === activeSection);

  return (
    <div className="lg:hidden mb-6">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 shadow-[var(--shadow-card)]"
          >
            <span>{activeItem?.label || "Select Section"}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)]">
          {navigationItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setOpen(false);
              }}
              className={cn(
                "cursor-pointer",
                activeSection === item.id && "bg-accent"
              )}
            >
              <span className="flex-1">{item.label}</span>
              {activeSection === item.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
