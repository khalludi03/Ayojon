import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/session-context";

export function NotificationBell() {
  const sessionContext = useSession();
  const isAuthenticated = !!sessionContext?.session?.user;

  // Query for unread count - only when authenticated
  const { data: unreadData } = useQuery({
    ...orpc.notifications.unreadCount.queryOptions(),
    enabled: isAuthenticated,
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
