import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  Copy,
  Home,
  LifeBuoy,
  MapPin,
  Phone,
  Truck,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { getStoredOrders } from "@/stores/order-store";
import { getRecentOrders } from "@/mock/services/account";
import type { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/track/$orderNumber")({
  component: TrackOrderPage,
});

const deliveryPeople = [
  {
    name: "Imran Hossain",
    phone: "+8801700112233",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
  },
  {
    name: "Nafisa Rahman",
    phone: "+8801800557788",
    photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=120&h=120&fit=crop",
  },
];

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const getTimeline = (order: Order) => {
  const baseDate = toDate(order.timeline?.placedAt || order.date);
  const confirmedAt = toDate(order.timeline?.confirmedAt || new Date(baseDate.getTime() + 4 * 3600000));
  const shippedAt = toDate(order.timeline?.shippedAt || new Date(baseDate.getTime() + 24 * 3600000));
  const outForDeliveryAt = new Date(baseDate.getTime() + 48 * 3600000);
  const deliveredAt = toDate(order.timeline?.deliveredAt || new Date(baseDate.getTime() + 72 * 3600000));

  return [
    { id: "placed", label: "Order Placed", timestamp: baseDate },
    { id: "confirmed", label: "Order Confirmed", timestamp: confirmedAt },
    { id: "shipped", label: "Shipped", timestamp: shippedAt, courier: "Steadfast" },
    { id: "out", label: "Out for Delivery", timestamp: outForDeliveryAt },
    { id: "delivered", label: "Delivered", timestamp: deliveredAt },
  ];
};

const getCurrentStage = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "delivered";
    case "shipped":
      return "out";
    case "processing":
      return "confirmed";
    case "pending":
      return "placed";
    default:
      return "placed";
  }
};

const formatDateTime = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) +
  " " +
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const normalizeOrderNumber = (value: string) => value.replace(/^#/, "").trim().toLowerCase();

function TrackOrderPage() {
  const { orderNumber } = Route.useParams();
  const [inputOrderNumber, setInputOrderNumber] = useState(orderNumber);
  const [contactValue, setContactValue] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [simulatedStageIndex, setSimulatedStageIndex] = useState<number | null>(null);
  const [eventFeed, setEventFeed] = useState<Array<{ id: string; label: string; timestamp: Date }>>([]);

  const orderData = useMemo(() => {
    const storedOrders = getStoredOrders();
    const fallbackOrders = getRecentOrders();
    return storedOrders.length > 0 ? storedOrders : fallbackOrders;
  }, []);

  const handleLookup = () => {
    const normalizedInput = normalizeOrderNumber(inputOrderNumber);
    const match = orderData.find(
      (entry) => normalizeOrderNumber(entry.orderNumber) === normalizedInput
    );

    if (!match) {
      setOrder(null);
      setIsVerified(false);
      toast.error("Order not found. Check the order number.");
      return;
    }

    const contact = contactValue.trim().toLowerCase();
    const email = match.address?.email?.toLowerCase();
    const phone = match.address?.phone?.toLowerCase();
    const canVerify = email || phone;

    if (!contact) {
      setOrder(null);
      setIsVerified(false);
      toast.error("Please enter the email or phone used for the order.");
      return;
    }

    if (!canVerify) {
      setOrder(null);
      setIsVerified(false);
      toast.error("This order cannot be verified for guest tracking. Please sign in.");
      return;
    }

    const matches = contact === email || contact === phone;
    if (!matches) {
      setOrder(null);
      setIsVerified(false);
      toast.error("Email or phone does not match this order.");
      return;
    }

    setOrder(match);
    setIsVerified(true);
  };

  useEffect(() => {
    if (!order) {
      setSimulatedStageIndex(null);
      setEventFeed([]);
      return;
    }

    const initialTimeline = getTimeline(order);
    const initialStageId = getCurrentStage(order.status);
    const initialIndex = initialTimeline.findIndex((step) => step.id === initialStageId);
    const safeIndex = initialIndex < 0 ? 0 : initialIndex;

    setSimulatedStageIndex(safeIndex);
    setEventFeed([
      {
        id: initialTimeline[safeIndex].id,
        label: initialTimeline[safeIndex].label,
        timestamp: new Date(),
      },
    ]);
  }, [order]);

  useEffect(() => {
    if (!order || simulatedStageIndex === null) {
      return undefined;
    }

    const timeline = getTimeline(order);
    if (simulatedStageIndex >= timeline.length - 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSimulatedStageIndex((prev) => {
        if (prev === null) {
          return prev;
        }

        const nextIndex = Math.min(prev + 1, timeline.length - 1);
        if (nextIndex !== prev) {
          const nextStep = timeline[nextIndex];
          setEventFeed((current) => [
            { id: nextStep.id, label: nextStep.label, timestamp: new Date() },
            ...current,
          ].slice(0, 5));
          toast.success(`Update: ${nextStep.label}`);
        }
        return nextIndex;
      });
    }, 8000);

    return () => window.clearInterval(interval);
  }, [order, simulatedStageIndex]);

  const shareTracking = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Tracking link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const timeline = order ? getTimeline(order) : [];
  const baseStage = order ? getCurrentStage(order.status) : "placed";
  const baseIndex = timeline.findIndex((step) => step.id === baseStage);
  const stageIndex = simulatedStageIndex ?? (baseIndex < 0 ? 0 : baseIndex);
  const currentStage = timeline[stageIndex]?.id || "placed";
  const deliveryPerson = deliveryPeople[0];
  const expectedDelivery = timeline[4]?.timestamp || new Date();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
          <p className="text-sm text-muted-foreground">
            Enter your order number and the email or phone used at checkout.
          </p>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Find your order</CardTitle>
            <CardDescription>Guest tracking requires order number + email or phone.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="order-number">Order number</Label>
              <Input
                id="order-number"
                value={inputOrderNumber}
                onChange={(event) => setInputOrderNumber(event.target.value)}
                placeholder="AYJ-2026-001234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-value">Email or phone</Label>
              <Input
                id="contact-value"
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder="you@email.com or +8801..."
              />
            </div>
            <Button type="button" onClick={handleLookup}>
              Track
            </Button>
          </CardContent>
        </Card>

        {isVerified && order ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                    <CardDescription>Expected by {formatDateTime(expectedDelivery)}</CardDescription>
                  </div>
                  <Badge className="w-fit bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                    Notifications enabled
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={shareTracking}>
                      <Copy className="mr-2 h-4 w-4" />
                      Share tracking link
                    </Button>
                    {currentStage === "out" && (
                      <Button asChild>
                        <a href={`tel:${deliveryPerson.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call delivery person
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" asChild>
                      <Link to="/account" search={{ section: "orders" }}>
                        View order details
                      </Link>
                    </Button>
                  </div>

                  {currentStage === "out" && (
                    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[hsl(var(--border))] p-4">
                      <img
                        src={deliveryPerson.photo}
                        alt={deliveryPerson.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{deliveryPerson.name}</p>
                        <p className="text-xs text-muted-foreground">Your delivery partner</p>
                        <p className="text-xs font-medium text-[hsl(var(--primary))]">
                          {deliveryPerson.phone}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://wa.me/${deliveryPerson.phone.replace(/\D/g, "")}`}>
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tracking Timeline</CardTitle>
                  <CardDescription>Live updates as your order moves.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeline.map((step, index) => {
                    const isComplete = index < stageIndex || step.id === currentStage;
                    const isActive = step.id === currentStage;

                    return (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              isComplete
                                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white"
                                : "border-[hsl(var(--border))] text-muted-foreground"
                            }`}
                          >
                            {isComplete ? <Check className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                          </div>
                          {index < timeline.length - 1 && (
                            <div
                              className={`h-10 w-px ${
                                index < stageIndex ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isActive ? "text-[hsl(var(--primary))]" : ""}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(step.timestamp)}</p>
                          {step.courier && (
                            <p className="text-xs text-muted-foreground">Courier: {step.courier}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Map</CardTitle>
                  <CardDescription>Mock location pins for this delivery.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-72 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(14,165,233,0.12))]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.2),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.2),transparent_55%)]" />
                    <div className="absolute left-[15%] top-[20%] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
                      <Warehouse className="h-4 w-4 text-[hsl(var(--primary))]" />
                      Warehouse
                    </div>
                    <div className="absolute left-[45%] top-[45%] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
                      <Truck className="h-4 w-4 text-[hsl(var(--primary))]" />
                      Package
                    </div>
                    <div className="absolute left-[70%] top-[65%] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
                      <Home className="h-4 w-4 text-[hsl(var(--primary))]" />
                      Delivery
                    </div>
                    <MapPin className="absolute left-[20%] top-[30%] h-6 w-6 text-[hsl(var(--primary))]" />
                    <MapPin className="absolute left-[52%] top-[52%] h-6 w-6 text-[hsl(var(--primary))]" />
                    <MapPin className="absolute left-[74%] top-[72%] h-6 w-6 text-[hsl(var(--primary))]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery address</CardTitle>
                  <CardDescription>Where your order is going.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-semibold">{order.address?.fullName || "Ayojon Customer"}</p>
                  <p className="text-muted-foreground">{order.address?.addressLine1 || "Address unavailable"}</p>
                  {order.address?.addressLine2 && (
                    <p className="text-muted-foreground">{order.address.addressLine2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.address?.city || ""} {order.address?.division || ""}
                    {order.address?.postalCode ? ` - ${order.address.postalCode}` : ""}
                  </p>
                  <p className="text-muted-foreground">{order.address?.phone || ""}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status summary</CardTitle>
                  <CardDescription>Current package location and next steps.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current status</span>
                    <span className="font-semibold capitalize">{currentStage.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Courier</span>
                    <span className="font-semibold">Steadfast Express</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Warehouse</span>
                    <span className="font-semibold">Dhaka Fulfillment Center</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live updates</CardTitle>
                  <CardDescription>SMS and email updates on status change.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {eventFeed.length === 0 ? (
                    <p className="text-muted-foreground">No updates yet.</p>
                  ) : (
                    eventFeed.map((event) => (
                      <div key={`${event.id}-${event.timestamp.toISOString()}`} className="flex items-center justify-between">
                        <span className="font-medium">{event.label}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need help?</CardTitle>
                  <CardDescription>Customer support is ready.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="mailto:support@ayojon.com"
                    className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"
                  >
                    <LifeBuoy className="h-4 w-4" />
                    support@ayojon.com
                  </a>
                  <a
                    href="tel:+8801234567890"
                    className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"
                  >
                    <Phone className="h-4 w-4" />
                    +880 1234 567890
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
