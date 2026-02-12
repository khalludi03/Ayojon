import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { orpc, orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/session-context";

export function NotificationBell() {
  const sessionContext = useSession();
  const isAuthenticated = !!sessionContext?.session?.user;
  const isVendor = sessionContext?.session?.user?.role === 'vendor';

  // Query for unread count - use vendor endpoint if vendor, otherwise use general notifications
  const { data: unreadData } = useQuery({
    queryKey: isVendor ? ['vendor', 'getNotificationsUnreadCount'] : ['notifications', 'unreadCount'],
    queryFn: async () => {
      if (isVendor) {
        // For vendors, fetch from vendor API
        return await orpcClient.vendor.getNotificationsUnreadCount();
      } else {
        // For regular users, use notifications API
        return await orpcClient.notifications.unreadCount();
      }
    },
    enabled: isAuthenticated,
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              {/* Pulsing red dot indicator */}
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              {/* Unread count badge */}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
