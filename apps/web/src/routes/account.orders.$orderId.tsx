import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { 
  Loader2, 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  Smartphone,
  Hash,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/account/orders/$orderId')({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = Route.useParams();
  const queryClient = useQueryClient();
  const [transactionId, setTransactionId] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');

  const { data: order, isLoading, error } = useQuery(
    orpc.order.getOrderDetails.queryOptions({
      input: { id: orderId },
    })
  );

  const submitPaymentMutation = useMutation(
    orpc.order.submitPayment.mutationOptions({
      onSuccess: () => {
        toast.success('Payment details submitted successfully! Our team will verify it shortly.');
        queryClient.invalidateQueries({ queryKey: orpc.order.getOrderDetails.key({ input: { id: orderId } }) });
        setTransactionId('');
        setSenderMobile('');
        setPaidAmount('');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to submit payment details');
      },
    })
  );

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !senderMobile || !paidAmount) {
      toast.error('Please fill in all payment details');
      return;
    }

    submitPaymentMutation.mutate({
      orderId,
      transactionId,
      senderMobile,
      amount: parseFloat(paidAmount),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive">Order Not Found</h2>
          <p className="mt-2 text-muted-foreground">The order you are looking for does not exist or you don't have permission to view it.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/account" search={{ section: 'orders' }}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPrepaid = order.paymentMethod === 'bkash' || order.paymentMethod === 'nagad' || order.paymentMethod === 'card';
  const needsPaymentSubmission = isPrepaid && (order.status === 'awaiting_payment' || order.status === 'payment_rejected');
  const payment = (order as any).payments?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
          <Link to="/account" search={{ section: 'orders' }}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Order History
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            Order #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OrderStatusBadge status={order.status} className="text-sm px-4 py-1" />
          {order.status === 'shipped' && order.trackingNumber && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Tracking: {order.trackingNumber}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* bKash Payment Submission Form */}
          {needsPaymentSubmission && (
            <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-lg overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6" />
                  <CardTitle className="text-xl">Submit Payment Details</CardTitle>
                </div>
                {order.status === 'payment_rejected' && (
                  <div className="mt-2 flex items-start gap-2 bg-white/20 p-2 rounded text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>Your previous payment submission was rejected. Please re-check your details and submit again.</p>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100 font-bold mb-2">
                    <Info className="h-4 w-4" />
                    <span>Payment Instructions</span>
                  </div>
                  <p className="text-sm text-indigo-800 dark:text-indigo-300">
                    Send <strong>৳{parseFloat(order.total).toLocaleString()}</strong> to bKash number: <strong>01700-000000</strong> using "Send Money". Then enter the details below.
                  </p>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="senderMobile">Sender bKash Number</Label>
                      <Input 
                        id="senderMobile"
                        placeholder="017XXXXXXXX"
                        value={senderMobile}
                        onChange={(e) => setSenderMobile(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Paid Amount (৳)</Label>
                      <Input 
                        id="paidAmount"
                        type="number"
                        placeholder={parseFloat(order.total).toString()}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID (TrxID)</Label>
                    <Input 
                      id="transactionId"
                      placeholder="8N7A6D5C4B"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12"
                    disabled={submitPaymentMutation.isPending}
                  >
                    {submitPaymentMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      'Submit for Verification'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Status Info for submitted payments */}
          {order.status === 'payment_submitted' && (
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
              <div className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
                <Clock className="h-6 w-6" />
                <h3 className="text-xl font-bold">Payment Verification in Progress</h3>
              </div>
              <p className="mt-2 text-blue-800 dark:text-blue-300">
                We have received your payment details (TrxID: <span className="font-mono font-bold uppercase">{order.paymentTransactionId}</span>). 
                Our team is currently verifying the transaction. This usually takes 15-30 minutes during business hours.
              </p>
            </div>
          )}

          {/* Order Items */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items Ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(order as any).items?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-16 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Quantity: {item.quantity} × {formatPrice(parseFloat(item.price))}
                        </p>
                        {item.variantInfo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variantInfo}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">
                      {formatPrice(item.quantity * parseFloat(item.price))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-3">
              <div className="flex justify-between w-full text-sm text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(parseFloat(order.subtotal))}</span>
              </div>
              <div className="flex justify-between w-full text-sm text-muted-foreground font-medium">
                <span>Shipping</span>
                <span>{formatPrice(parseFloat(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between w-full text-lg font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount</span>
                <span className="text-primary">{formatPrice(parseFloat(order.total))}</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Shipping Address */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{order.shippingName}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {order.shippingAddressLine1}<br />
                  {order.shippingAddressLine2 && <>{order.shippingAddressLine2}<br /></>}
                  {order.shippingCity}, {order.shippingDivision} {order.shippingPostalCode}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.shippingPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{(order as any).user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Method</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Payment Status</span>
                <span className={cn(
                  "font-bold uppercase",
                  order.status === 'payment_received' || order.status === 'vendor_paid' ? "text-green-600" : "text-amber-600"
                )}>
                  {order.status === 'payment_received' || order.status === 'vendor_paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.paymentTransactionId && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Transaction Details</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">TrxID</span>
                    <span className="font-mono font-bold uppercase">{order.paymentTransactionId}</span>
                  </div>
                  {payment?.senderMobile && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sender</span>
                      <span className="font-bold">{payment.senderMobile}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline / Status Help */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">If you have any questions regarding your order or payment, please contact us.</p>
            <div className="space-y-3">
              <a href="mailto:support@ayojon.com" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Mail className="h-4 w-4" /> support@ayojon.com
              </a>
              <a href="tel:+8801234567890" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Phone className="h-4 w-4" /> +880 1234 567890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
