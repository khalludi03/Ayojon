import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  Copy,
  Home,
  LifeBuoy,
  Loader2,
  MapPin,
  Phone,
  Truck,
  Warehouse,
  Package,
  Clock,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track/$orderNumber")({
  component: TrackOrderPage,
});

const toDate = (value: string | Date | undefined) => {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
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

function TrackOrderPage() {
  const { orderNumber } = Route.useParams();
  const navigate = useNavigate();
  const [inputOrderNumber, setInputOrderNumber] = useState(orderNumber);

  // Queries
  const { data: order, isLoading, error, refetch } = useQuery(
    orpc.order.trackOrder.queryOptions({
      input: { orderNumber },
    })
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderNumber.trim()) {
      toast.error("Please enter an order number.");
      return;
    }
    navigate({ to: "/track/$orderNumber", params: { orderNumber: inputOrderNumber.trim() } });
  };

  const shareTracking = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Tracking link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const timelineSteps = useMemo(() => {
    if (!order) return [];
    
    const placedAt = toDate(order.createdAt);
    // Mocking some progress timestamps if they don't exist in DB yet
    // Real app would have these from order history/logs
    const confirmedAt = new Date(placedAt.getTime() + 2 * 3600000);
    const shippedAt = new Date(placedAt.getTime() + 24 * 3600000);
    const outAt = new Date(placedAt.getTime() + 48 * 3600000);
    const deliveredAt = new Date(placedAt.getTime() + 72 * 3600000);

    return [
      { id: 'awaiting_payment', label: 'Order Placed', icon: Clock, timestamp: placedAt },
      { id: 'payment_received', label: 'Order Confirmed', icon: Smartphone, timestamp: confirmedAt },
      { id: 'shipped', label: 'Shipped', icon: Truck, timestamp: shippedAt, courier: "Steadfast Express" },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: Package, timestamp: outAt },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle2, timestamp: deliveredAt },
    ];
  }, [order]);

  const currentStatus = order?.status || 'awaiting_payment';
  
  // Logic to determine which steps are complete
  const getStepIndex = (status: string) => {
    if (status === 'delivered') return 4;
    if (status === 'shipped') return 2; // Can be 2 (Shipped) or 3 (Out for delivery)
    if (status === 'confirmed' || status === 'payment_received' || status === 'placed' || status === 'processing') return 1;
    return 0; // awaiting_payment, payment_submitted
  };

  const activeIndex = getStepIndex(currentStatus);

  // Calculate estimated delivery: 3-5 days from order date
  const estimatedDelivery = useMemo(() => {
    if (!order) return null;
    const date = new Date(order.createdAt);
    const minDate = new Date(date);
    minDate.setDate(date.getDate() + 3);
    const maxDate = new Date(date);
    maxDate.setDate(date.getDate() + 5);
    
    return {
      min: minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      max: maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }, [order]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="pl-0 mb-4 hover:bg-transparent">
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Store
            </Link>
          </Button>
          <h1 className="text-4xl font-black tracking-tight">Track your order</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Enter your order number to see real-time updates.
          </p>
        </div>

        <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor="order-number" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Order number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="order-number"
                    value={inputOrderNumber}
                    onChange={(event) => setInputOrderNumber(event.target.value)}
                    placeholder="AYJ-2026-123456"
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Button type="submit" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
                Track Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-muted-foreground font-medium animate-pulse">Fetching order details...</p>
          </div>
        )}

        {error && (
          <Card className="border-2 border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
            <CardContent className="p-10 text-center">
              <AlertCircle className="h-16 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Order Not Found</h3>
              <p className="text-red-800 dark:text-red-300 mt-2">
                We couldn't find an order with number <strong>#{orderNumber}</strong>. <br/>
                Please double-check the number or contact support.
              </p>
              <Button onClick={() => setInputOrderNumber('')} variant="outline" className="mt-6 border-red-200">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="grid gap-8 lg:grid-cols-[1fr_350px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-8">
              {/* Status Banner */}
              <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <Package className="h-5 w-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Order Details</span>
                    </div>
                    <CardTitle className="text-2xl font-black">Order #{order.orderNumber}</CardTitle>
                    {estimatedDelivery && !['delivered', 'cancelled'].includes(order.status) && (
                      <CardDescription className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                        Estimated arrival: {estimatedDelivery.min} - {estimatedDelivery.max}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={shareTracking} className="rounded-lg font-bold gap-2">
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-lg font-bold">
                      <Link to="/account/orders/$orderId" params={{ orderId: order.id }}>
                        Full Details
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="border-t border-slate-100 dark:border-slate-800 pt-6">
                   {/* Vertical Timeline */}
                   <div className="space-y-8">
                    {timelineSteps.map((step, index) => {
                      const isComplete = index < activeIndex || (currentStatus === 'delivered' && index === 4);
                      const isInProgress = index === activeIndex && currentStatus !== 'delivered';
                      const isPending = index > activeIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="relative flex gap-6 group">
                          {/* Vertical Line */}
                          {index < timelineSteps.length - 1 && (
                            <div className={cn(
                              "absolute left-6 top-10 bottom-[-32px] w-[2px] transition-colors duration-500",
                              index < activeIndex ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800"
                            )} />
                          )}
                          
                          <div className={cn(
                            "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-500 shadow-lg",
                            isComplete ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/20" : 
                            isInProgress ? "bg-white border-indigo-600 text-indigo-600 animate-pulse" : 
                            "bg-white border-slate-100 text-slate-300 dark:bg-slate-900 dark:border-slate-800"
                          )}>
                            {isComplete ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                          </div>

                          <div className="flex-1 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <p className={cn(
                                "text-base font-black uppercase tracking-wider",
                                isComplete || isInProgress ? "text-slate-900 dark:text-white" : "text-slate-300"
                              )}>
                                {step.label}
                                {isInProgress && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full animate-pulse">In Progress</span>}
                              </p>
                              {(isComplete || isInProgress) && (
                                <span className="text-xs font-bold text-muted-foreground bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                                  {formatDateTime(step.timestamp)}
                                </span>
                              )}
                            </div>
                            
                            {isComplete && step.courier && (
                              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-indigo-600">
                                <Truck className="h-4 w-4" />
                                <span>Via {step.courier}</span>
                              </div>
                            )}

                            {isInProgress && step.id === 'out_for_delivery' && (
                              <div className="mt-4 p-4 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-indigo-900 bg-indigo-50/30">
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Delivery Partner Assigned</p>
                                    <p className="text-xs text-muted-foreground font-medium">Contact your delivery person for updates.</p>
                                  </div>
                                  <Button size="sm" className="bg-indigo-600 font-bold rounded-lg shadow-md" disabled>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Delivery (Soon)
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    Live Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-80 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/d/u/0/thumbnail?mid=1_v_Z8_Z8_Z8_Z8_Z8_Z8_Z8_Z8')] bg-cover" />
                    <div className="relative z-10 flex flex-col items-center gap-4 text-center p-10">
                      <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center animate-bounce">
                        <Truck className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">GPS Tracking Feature</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Real-time delivery map is coming soon to your area.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Recipient</p>
                    <p className="font-bold text-slate-900 dark:text-white">{order.shippingName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {order.shippingAddressLine1}<br />
                      {order.shippingCity}, {order.shippingDivision} {order.shippingPostalCode}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Contact</p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Phone className="h-4 w-4 text-indigo-600" />
                      {order.shippingPhone}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Package Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Order Status</span>
                    <OrderStatusBadge status={order.status} className="text-[10px]" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Items</span>
                    <span className="font-bold">{(order as any).items?.length || 0} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Courier</span>
                    <span className="font-bold">Steadfast Express</span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900 shadow-sm">
                <h4 className="font-black text-slate-900 dark:text-white mb-2">Need help?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium leading-relaxed">
                  Our support team is available 24/7 for any inquiries.
                </p>
                <div className="space-y-3">
                  <a href="tel:+8801234567890" className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:underline">
                    <Phone className="h-4 w-4" /> +880 1234 567890
                  </a>
                  <a href="mailto:support@ayojon.com" className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:underline">
                    <LifeBuoy className="h-4 w-4" /> support@ayojon.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}