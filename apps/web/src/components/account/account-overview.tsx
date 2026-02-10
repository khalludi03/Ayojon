import { Link } from "@tanstack/react-router";
import { Package, Heart, ArrowRight, User } from "lucide-react";
import type { AccountStats, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrencyPrice } from "@/lib/currency";

interface AccountOverviewProps {
  userName: string;
  userImage?: string;
  stats: AccountStats;
  recentOrders: Order[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  awaiting_payment: { label: "Awaiting Payment", color: "bg-amber-500" },
  payment_submitted: { label: "Verifying Payment", color: "bg-blue-500" },
  payment_received: { label: "Payment Received", color: "bg-indigo-500" },
  payment_rejected: { label: "Payment Rejected", color: "bg-rose-500" },
  placed: { label: "Order Placed", color: "bg-sky-500" },
  pending: { label: "Pending", color: "bg-yellow-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

export function AccountOverview({ userName, userImage, stats, recentOrders }: AccountOverviewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const latestOrder = recentOrders[0];

  return (
    <div className="space-y-6">
      {/* Welcome Message with Avatar */}
      <Card className="overflow-hidden border-0 bg-[linear-gradient(120deg,rgba(244,78,55,0.12),rgba(51,163,153,0.12))]">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Avatar - Responsive size */}
            <Avatar className="h-20 w-20 border-2 border-white/60 shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 sm:border-4">
              <AvatarImage src={userImage || undefined} alt={userName} />
              <AvatarFallback className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            {/* Text Content */}
            <div className="flex-1">
              <h1 className="account-heading text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage your orders and account settings
              </p>
            </div>

            {/* Edit Profile Button */}
            <Button variant="outline" size="sm" className="sm:size-default w-full sm:w-auto" asChild>
              <Link to="/account" search={{ section: "profile" }}>
                <User className="mr-2 h-4 w-4" />
                <span className="sm:inline">Edit Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 bg-[hsl(var(--card))]/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime purchases
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[hsl(var(--card))]/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wishlistItems}</div>
            <p className="text-xs text-muted-foreground">
              Saved for later
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 bg-[hsl(var(--card))]/90 shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your last 3 orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to="/account/orders/$orderId"
                params={{ orderId: order.id }}
                className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
              >
                {/* Left side: Image and Order Info */}
                <div className="flex items-start gap-2 sm:items-center sm:gap-3 md:gap-4">
                  {order.imageUrl && (
                    <img
                      src={order.imageUrl}
                      alt="Order"
                      className="h-12 w-12 shrink-0 rounded object-cover sm:h-14 sm:w-14 md:h-16 md:w-16"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold sm:text-base">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {/* Mobile: Short date format */}
                      <span className="sm:hidden">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {/* Desktop: Long date format */}
                      <span className="hidden sm:inline">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {Array.isArray(order.items) ? order.items.length : order.items} {((Array.isArray(order.items) ? order.items.length : order.items) === 1) ? "item" : "items"}
                    </p>
                  </div>
                </div>

                {/* Right side: Price, Status, and Arrow */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-sm font-semibold sm:text-base">{formatCurrencyPrice(parseFloat(order.total as any))}</p>
                    <Badge
                      variant="secondary"
                      className={`${statusConfig[order.status]?.color || "bg-slate-500"} mt-1 text-[10px] text-white sm:text-xs`}
                    >
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </div>
                  <div className="h-8 w-8 flex items-center justify-center shrink-0 sm:h-9 sm:w-9 text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 bg-[hsl(var(--card))]/90 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {latestOrder ? (
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/track/$orderNumber" params={{ orderNumber: latestOrder.orderNumber }}>
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/account" search={{ section: "orders" }}>
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/account" search={{ section: "wishlist" }}>
                <Heart className="h-4 w-4 mr-2" />
                View Wishlist
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
