import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { env } from "@my-better-t-app/env/web";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpdateUserData = Parameters<typeof authClient.updateUser>[0];
type AuthSession = Awaited<ReturnType<typeof authClient.getSession>>;
import { getRecentOrders } from "@/mock/services/account";
import type { Order } from "@/types";
import { useWishlist } from "@/stores/wishlist-store";
import { useCart } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;
  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statusConfig: Record<Order["status"], { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300" },
    processing: { label: "Confirmed", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300" },
  };

  useEffect(() => {
    setOrders(getRecentOrders());
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, startDate, endDate, orders.length]);

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

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const startDateValue = startDate ? new Date(startDate) : null;
    const endDateValue = endDate ? new Date(endDate) : null;
    if (endDateValue) {
      endDateValue.setHours(23, 59, 59, 999);
    }

    return orders
      .filter((order) => {
        if (statusFilter === "all") {
          return true;
        }
        return order.status === statusFilter;
      })
      .filter((order) => {
        if (!normalizedSearch) {
          return true;
        }
        return order.orderNumber.toLowerCase().includes(normalizedSearch);
      })
      .filter((order) => {
        const orderDate = new Date(order.date);
        if (startDateValue && orderDate < startDateValue) {
          return false;
        }
        if (endDateValue && orderDate > endDateValue) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, statusFilter, searchTerm, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasOrders = orders.length > 0;
  const hasFilteredResults = pagedOrders.length > 0;
  const resultsStart = filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const resultsEnd = Math.min(currentPage * pageSize, filteredOrders.length);

  const formatOrderNumber = (orderNumber: string) =>
    orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;

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
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-3">
                <Label htmlFor="order-search" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Search by order number
                </Label>
                <Input
                  id="order-search"
                  placeholder="Search by order number"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orders-start-date" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Start date
                </Label>
                <Input
                  id="orders-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orders-end-date" className="text-xs uppercase tracking-wide text-muted-foreground">
                  End date
                </Label>
                <Input
                  id="orders-end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            {!hasOrders ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]/40">
                  <ShoppingCart className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">No orders yet</p>
                  <p className="text-xs text-muted-foreground">Start shopping to place your first order.</p>
                </div>
                <Button size="sm" asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : !hasFilteredResults ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-6 text-center">
                <div>
                  <p className="text-sm font-semibold">No matching orders</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters or search.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pagedOrders.map((order) => {
                  const thumbnails = (order.lineItems || [])
                    .map((item) => item.imageUrl)
                    .filter(Boolean)
                    .slice(0, 3) as string[];
                  const hasThumbnails = thumbnails.length > 0;
                  const badge = statusConfig[order.status];

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm font-semibold">{formatOrderNumber(order.orderNumber)}</p>
                            <Badge className={`${badge.className} text-[10px] sm:text-xs`}>{badge.label}</Badge>
                          </div>
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
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{order.items} items</span>
                          <span className="font-semibold">{formatPrice(order.total)}</span>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" size="sm" variant="outline" asChild>
                              <Link to="/account/orders/$orderId" params={{ orderId: order.id }}>
                                View Details
                              </Link>
                            </Button>
                            {order.status === "shipped" && (
                              <Button type="button" size="sm" asChild>
                                <Link to="/track/$orderNumber" params={{ orderNumber: order.orderNumber }}>
                                  Track Order
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-3">
                        {hasThumbnails ? (
                          thumbnails.map((imageUrl, index) => (
                            <img
                              key={`${order.id}-thumb-${index}`}
                              src={imageUrl}
                              alt={`${order.orderNumber} item ${index + 1}`}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ))
                        ) : order.imageUrl ? (
                          <img
                            src={order.imageUrl}
                            alt={order.orderNumber}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-xs font-semibold">
                            {order.items} items
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-col gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">
                    Showing {resultsStart}-{resultsEnd} of {filteredOrders.length} orders
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
  session: AuthSession;
}

export function AccountProfile({ session }: AccountProfileProps) {
  const router = useRouter();
  const user = session?.user;

  const [profileImage, setProfileImage] = useState<string | null>(user?.image || null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState(user?.gender || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Check for changes to enable/disable buttons
  useEffect(() => {
    const isNameChanged = name !== (user?.name || "");
    const isEmailChanged = email !== (user?.email || "");
    const isPhoneChanged = phoneNumber !== (user?.phoneNumber || "");
    const isGenderChanged = gender !== (user?.gender || "");
    const isImageChanged = profileImage !== (user?.image || null);
    
    // Date comparison
    const originalDob = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "";
    const isDobChanged = dateOfBirth !== originalDob;

    setHasChanges(isNameChanged || isEmailChanged || isPhoneChanged || isDobChanged || isGenderChanged || isImageChanged);
  }, [name, email, phoneNumber, dateOfBirth, gender, profileImage, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhoneNumber(user?.phoneNumber || "");
    setGender(user?.gender || "");
    setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "");
    setProfileImage(user?.image || null);
    setHasChanges(false);
    toast.info("Changes discarded");
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
    if (!name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    const normalizedEmail = email.trim();
    const currentEmail = user?.email || "";

    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const isSameEmail = normalizedEmail.toLowerCase() === currentEmail.toLowerCase();
    if (isSameEmail && normalizedEmail !== currentEmail) {
      setEmail(currentEmail);
    }

    setIsSaving(true);
    try {
      const updateData: UpdateUserData = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        image: profileImage,
      };

      const hasNonEmailChanges =
        name.trim() !== (user?.name || "") ||
        phoneNumber.trim() !== (user?.phoneNumber || "") ||
        gender !== (user?.gender || "") ||
        (dateOfBirth || "") !== (user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "") ||
        profileImage !== (user?.image || null);

      // 1. Handle Email Change if it's different
      if (!isSameEmail) {
        // Save non-email changes first, so they aren't lost if OTP is canceled
        if (hasNonEmailChanges) {
          const { error: updateError } = await authClient.updateUser(updateData);
          if (updateError) throw new Error(updateError.message || "Failed to update profile details");
        }

        // Send OTP to the new email using custom endpoint
        const response = await fetch(`${env.VITE_SERVER_URL}/api/email-change/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: normalizedEmail }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(
            result.error || "Failed to send verification code"
          );
        }

        // Store the pending email and show OTP dialog
        setPendingEmail(normalizedEmail);
        setShowOTPDialog(true);
        toast.success(`Verification code sent to ${normalizedEmail}`);
        setIsSaving(false);
        return; // Stop here and wait for OTP verification
      }

      // 2. Handle Profile Update for other fields (when email hasn't changed)
      const { error: updateError } = await authClient.updateUser(updateData);

      if (updateError) throw new Error(updateError.message || "Failed to update profile details");

      toast.success("Profile updated successfully!");
      router.invalidate();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      // Verify the OTP and update email using custom endpoint
      const response = await fetch(`${env.VITE_SERVER_URL}/api/email-change/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: pendingEmail,
          otp: otp.trim(),
        }),
      });

      const verifyResult = await response.json();

      if (!response.ok || verifyResult.error) {
        throw new Error(
          verifyResult.error || "Invalid verification code"
        );
      }

      // Email has been updated on the server

      // Update other profile fields
      const updateData: UpdateUserData = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        image: profileImage,
      };

      const { error: updateError } = await authClient.updateUser(updateData);

      if (updateError) throw new Error(updateError.message || "Failed to update profile details");

      toast.success("Email verified and profile updated successfully!");
      setShowOTPDialog(false);
      setOtp("");
      setPendingEmail("");
      router.invalidate();
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify code");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${env.VITE_SERVER_URL}/api/email-change/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          result.error || "Failed to resend code"
        );
      }

      toast.success(`Verification code resent to ${pendingEmail}`);
      setOtp(""); // Clear the input field
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    }
  };

  const handleCloseOTPDialog = () => {
    setShowOTPDialog(false);
    setOtp("");
    setPendingEmail("");
    // Reset email to original value
    setEmail(user?.email || "");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              This will be displayed on your profile and across the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-muted transition-all duration-200 group-hover:opacity-90">
                  <AvatarImage src={profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                {profileImage && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors h-10"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Image
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              Update your basic information to get personalized experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-sm font-semibold">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+880 1XXX-XXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-semibold">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Add your birthday for exclusive discounts!
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t bg-muted/50 py-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              className="px-8"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog
        open={showOTPDialog}
        onOpenChange={(open) => {
          if (open) {
            setShowOTPDialog(true);
          } else {
            handleCloseOTPDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to <strong>{pendingEmail}</strong>.
              Please enter it below to confirm your new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                The code will expire in 5 minutes
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isVerifyingOTP}
            >
              Resend Code
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={handleCloseOTPDialog}
                disabled={isVerifyingOTP}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
                className="flex-1"
              >
                {isVerifyingOTP ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { ChangePasswordForm } from "./change-password-form";

export function AccountSettings({ session }: { session?: AuthSession }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your account preferences and security
        </p>
      </div>

      <div className="grid gap-6">
        <ChangePasswordForm userEmail={session?.user?.email} />
        
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Coming soon: Manage how you receive updates</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
