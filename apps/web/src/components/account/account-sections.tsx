import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStoredOrders } from "@/stores/order-store";
import type { Order } from "@/types";
import { useWishlist } from "@/stores/wishlist-store";
import { useCart } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300";
      default:
        return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
    }
  };

  const formatDeliveryMethod = (method?: string) => {
    switch (method) {
      case "standard":
        return "Standard Delivery";
      case "express":
        return "Express Delivery";
      case "same-day":
        return "Same-Day Delivery";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your order history
          </p>
        </div>
        <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All your past and current orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet. Place your first order to see it here.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {order.imageUrl ? (
                        <img
                          src={order.imageUrl}
                          alt={order.orderNumber}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-sm font-semibold">
                          #{order.items}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {formatDeliveryMethod(order.deliveryMethod) && (
                          <p className="text-xs text-muted-foreground">
                            {formatDeliveryMethod(order.deliveryMethod)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-muted-foreground">{order.items} items</span>
                      <span className="font-semibold">৳{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {order.lineItems && order.lineItems.length > 0 && (
                    <div className="grid gap-3 border-t border-[hsl(var(--border))] pt-3 sm:grid-cols-2">
                      {order.lineItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-xs font-semibold">
                              x{item.quantity}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} · ৳{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountWishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (productId: string) => {
    const item = items.find((wishlistItem) => wishlistItem.productId === productId);
    if (!item) return;
    addItem(item.product, 1, item.product.variants?.[0]);
    removeItem(productId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          Items you've saved for later
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
          <CardDescription>Your wishlist collection</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]/40">
                <Heart className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Your wishlist is empty</p>
                <p className="text-xs text-muted-foreground">Save items to view them here.</p>
              </div>
              <Button size="sm" asChild>
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.product.images?.[0]?.url || "/placeholder.png"}
                      alt={item.product.images?.[0]?.alt || item.product.title}
                      className="h-16 w-16 rounded-lg border border-[hsl(var(--border))] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] line-clamp-2">
                        {item.product.title}
                      </p>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        Saved on {new Date(item.addedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[hsl(var(--foreground))]">
                        {formatPrice(item.product.pricing.currentPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMoveToCart(item.productId)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Move to Cart
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountAddresses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
        <p className="text-muted-foreground mt-2">
          Manage your shipping and billing addresses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Your delivery locations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Addresses section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface AccountProfileProps {
  userName?: string;
  userEmail?: string;
}

export function AccountProfile({ userName = "User", userEmail = "user@example.com" }: AccountProfileProps) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
  }, [userName, userEmail]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Validate inputs
      if (!name || name.trim().length === 0) {
        toast.error("Name is required");
        setIsSaving(false);
        return;
      }

      // Update user profile via better-auth
      const updateData: { name: string; image?: string } = {
        name: name.trim(),
      };

      // Include image if it was changed
      if (profileImage) {
        updateData.image = profileImage;
      }

      const response = await authClient.updateUser(updateData);

      if (response.error) {
        throw new Error(response.error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");

      // Refresh the page to update the session data
      router.invalidate();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base">
          Update your personal information and profile picture
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Avatar - Responsive size */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
              <AvatarImage src={profileImage || undefined} alt={name} />
              <AvatarFallback className="text-xl sm:text-2xl md:text-3xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            {/* Upload Controls */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Label htmlFor="profile-picture" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4">
                  <Camera className="h-4 w-4" />
                  <span>Change Picture</span>
                </div>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Label>
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Update your name and email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="text-sm sm:text-base"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="text-sm sm:text-base"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Preferences and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
