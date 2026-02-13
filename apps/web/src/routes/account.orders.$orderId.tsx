import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Truck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/ui/order-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/stores/cart-store'
import { generateInvoicePDF } from '@/utils/invoice-generator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ReviewFormModal } from '@/components/product/ReviewFormModal'

export const Route = createFileRoute('/account/orders/$orderId')({
  component: OrderDetailsPage,
})

const CANCELLATION_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Incorrect items in order',
  'Delivery time is too long',
  'Duplicate order',
  'Other',
]

function OrderDetailsPage() {
  const { orderId } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [transactionId, setTransactionId] = useState('')
  const [senderMobile, setSenderMobile] = useState('')
  const [paidAmount, setPaidAmount] = useState<string>('')

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelComment, setCancelComment] = useState('')

  // Review Modal State
  const [reviewProduct, setReviewProduct] = useState<{
    id: string
    title: string
    imageUrl?: string
  } | null>(null)

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery(
    orpc.order.getOrderDetails.queryOptions({
      input: { id: orderId },
    }),
  )
  const order = orderData as any

  const submitPaymentMutation = useMutation(
    orpc.order.submitPayment.mutationOptions({
      onSuccess: () => {
        toast.success(
          'Payment details submitted successfully! Our team will verify it shortly.',
        )
        queryClient.invalidateQueries({
          queryKey: orpc.order.getOrderDetails.key({
            input: { id: orderId },
          }),
        })
        setTransactionId('')
        setSenderMobile('')
        setPaidAmount('')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to submit payment details')
      },
    }),
  )

  const cancelOrderMutation = useMutation(
    orpc.order.cancelOrder.mutationOptions({
      onSuccess: () => {
        toast.success('Order cancelled successfully')
        queryClient.invalidateQueries({
          queryKey: orpc.order.getOrderDetails.key({
            input: { id: orderId },
          }),
        })
        setIsCancelModalOpen(false)
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to cancel order')
      },
    }),
  )

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionId || !senderMobile || !paidAmount) {
      toast.error('Please fill in all payment details')
      return
    }

    ;(submitPaymentMutation.mutate as any)({
      orderId,
      transactionId,
      senderMobile,
      amount: parseFloat(paidAmount),
    })
  }

  const handleCancelOrder = () => {
    if (!cancelReason) {
      toast.error('Please select a reason for cancellation')
      return
    }
    const fullReason = cancelComment
      ? `${cancelReason}: ${cancelComment}`
      : cancelReason
    ;(cancelOrderMutation.mutate as any)({
      id: orderId,
      reason: fullReason,
    })
  }

  const handleBuyAgain = () => {
    if (!order) return
    order.items?.forEach((item: any) => {
      const mockProduct = {
        id: item.productId,
        title: item.title,
        pricing: { currentPrice: parseFloat(item.price) },
        images: item.imageUrl ? [{ url: item.imageUrl }] : [],
        vendor: { id: item.vendorId },
      }
      addItem(mockProduct as any, item.quantity)
    })

    toast.success('Items added to cart')
    navigate({ to: '/cart' })
  }

  const handleDownloadInvoice = () => {
    if (!order) return
    const currentOrder = order

    try {
      generateInvoicePDF({
        orderNumber: currentOrder.orderNumber,
        createdAt: currentOrder.createdAt,
        shippingName: currentOrder.shippingName,
        shippingAddressLine1: currentOrder.shippingAddressLine1,
        shippingAddressLine2: currentOrder.shippingAddressLine2,
        shippingCity: currentOrder.shippingCity,
        shippingDivision: currentOrder.shippingDivision,
        shippingPostalCode: currentOrder.shippingPostalCode,
        shippingPhone: currentOrder.shippingPhone,
        paymentMethod: currentOrder.paymentMethod,
        subtotal: currentOrder.subtotal,
        shippingCost: currentOrder.shippingCost,
        tax: currentOrder.tax,
        discount: currentOrder.discount,
        total: currentOrder.total,
        items:
          currentOrder.items?.map((item: any) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: parseFloat(item.price),
            variantInfo: item.variantInfo,
          })) || [],
        userEmail: currentOrder.user?.email,
      })
      toast.success('Invoice generated successfully')
    } catch (err) {
      console.error('Failed to generate invoice:', err)
      toast.error('Failed to generate invoice')
    }
  }

  const handleReturnItems = () => {
    toast.info('Return process coming soon')
  }

  const estimatedDelivery = useMemo(() => {
    if (!order) return null
    const date = new Date(order.createdAt)
    const minDate = new Date(date)
    minDate.setDate(date.getDate() + 3)
    const maxDate = new Date(date)
    maxDate.setDate(date.getDate() + 5)

    return {
      min: minDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      max: maxDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }
  }, [order])

  if (!order) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive">
            Order Not Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            The order you are looking for does not exist or you don't have
            permission to view it.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/account/orders">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const isPrepaid =
    order.paymentMethod === 'bkash' ||
    order.paymentMethod === 'nagad' ||
    order.paymentMethod === 'card'
  const needsPaymentSubmission =
    isPrepaid &&
    (order.status === 'awaiting_payment' || order.status === 'payment_rejected')

  // Can only cancel if payment is NOT received/confirmed and NOT shipped
  const canCancel =
    order.status === 'awaiting_payment' ||
    order.status === 'payment_submitted' ||
    order.status === 'placed' ||
    order.status === 'payment_rejected'

  const isDelivered = order.status === 'delivered'
  const isShipped = order.status === 'shipped'

  const isPaymentReceived = isPrepaid
    ? ['payment_received', 'shipped', 'delivered', 'vendor_paid'].includes(
        order.status,
      )
    : ['cash_collected', 'settlement_ready', 'vendor_settled'].includes(
        order.status,
      )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
          <Link to="/account/orders">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Order History
          </Link>
        </Button>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            Order #{order.orderNumber}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <p className="text-muted-foreground font-medium">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            {estimatedDelivery &&
              !['delivered', 'cancelled'].includes(order.status) && (
                <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  <Truck className="h-4 w-4" />
                  <span>
                    Estimated Delivery: {estimatedDelivery.min} -{' '}
                    {estimatedDelivery.max}
                  </span>
                </div>
              )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <OrderStatusBadge
            status={order.status}
            className="text-sm px-4 py-1"
          />
          {isPaymentReceived && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {!['cancelled', 'returned'].includes(order.status) && (
        <Card className="mb-8 border-2 border-slate-100 dark:border-slate-800">
          <CardContent className="pt-6">
            <OrderProgress currentStatus={order.status} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Action Alerts / Forms */}
          {needsPaymentSubmission && (
            <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6" />
                  <CardTitle className="text-xl">
                    Submit Payment Details
                  </CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                    Please send{' '}
                    <strong>৳{parseFloat(order.total).toLocaleString()}</strong>{' '}
                    to our bKash number: <strong>01700-000000</strong> using
                    "Send Money", then submit the details below for
                    verification.
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
                    <Label htmlFor="transactionId">
                      Transaction ID (TrxID)
                    </Label>
                    <Input
                      id="transactionId"
                      placeholder="8N7A6D5C4B"
                      value={transactionId}
                      onChange={(e) =>
                        setTransactionId(e.target.value.toUpperCase())
                      }
                      className="font-mono uppercase"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-lg shadow-indigo-500/20"
                    disabled={submitPaymentMutation.isPending}
                  >
                    {submitPaymentMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit Payment Details
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-indigo-600" />
                Items Ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-20 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate text-lg">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            {formatPrice(parseFloat(item.price))} each
                          </span>
                        </div>
                        {item.variantInfo && (
                          <p className="text-xs text-muted-foreground mt-2 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded inline-block">
                            {item.variantInfo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      <p className="font-black text-slate-900 dark:text-white text-lg">
                        {formatPrice(item.quantity * parseFloat(item.price))}
                      </p>
                      {isDelivered && (
                        <ReviewButton
                          productId={item.productId}
                          onWriteReview={() =>
                            setReviewProduct({
                              id: item.productId,
                              title: item.title,
                              imageUrl: item.imageUrl,
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              onClick={handleBuyAgain}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              <ShoppingBag className="h-4 w-4" />
              Buy Items Again
            </Button>

            {isShipped && (
              <Button
                asChild
                variant="outline"
                className="gap-2 font-bold border-indigo-200 text-indigo-600"
              >
                <Link
                  to="/track/$orderNumber"
                  params={{ orderNumber: order.orderNumber }}
                >
                  <Truck className="h-4 w-4" />
                  Track Order
                </Link>
              </Button>
            )}

            {isDelivered && (
              <Button
                onClick={handleReturnItems}
                variant="outline"
                className="gap-2 font-bold"
              >
                <RotateCcw className="h-4 w-4" />
                Return Items (Coming Soon)
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={() => setIsCancelModalOpen(true)}
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Price Breakdown */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatPrice(parseFloat(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Shipping Fee</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatPrice(parseFloat(order.shippingCost))}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Tax & VAT</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatPrice(parseFloat(order.tax))}
                </span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatPrice(parseFloat(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-black text-indigo-600">
                  {formatPrice(parseFloat(order.total))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-black text-slate-900 dark:text-white text-base">
                  {order.shippingName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  {order.shippingAddressLine1}
                  <br />
                  {order.shippingAddressLine2 && (
                    <>
                      {order.shippingAddressLine2}
                      <br />
                    </>
                  )}
                  {order.shippingCity}, {order.shippingDivision}{' '}
                  {order.shippingPostalCode}
                </p>
              </div>
              <div className="space-y-3 px-1">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>{order.shippingPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="truncate">{order.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="font-black uppercase text-sm tracking-wider">
                    {order.paymentMethod}
                  </span>
                </div>
                <Badge
                  className={cn(
                    'font-bold uppercase tracking-widest text-[10px]',
                    order.status === 'payment_received' ||
                      order.status === 'vendor_paid'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500',
                  )}
                >
                  {order.status === 'payment_received' ||
                  order.status === 'vendor_paid'
                    ? 'Paid'
                    : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Phone className="h-5 w-5" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg">
                Need Help?
              </h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              If you have any questions regarding your order or payment
              verification, we're here to help.
            </p>
            <div className="space-y-4">
              <a
                href="tel:+8801234567890"
                className="flex items-center gap-4 group"
              >
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Call us
                  </span>
                  <span className="text-sm font-black text-indigo-600">
                    +880 1234 567890
                  </span>
                </div>
              </a>
              <a
                href="mailto:support@ayojon.com"
                className="flex items-center gap-4 group"
              >
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900 group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Email us
                  </span>
                  <span className="text-sm font-black text-indigo-600">
                    support@ayojon.com
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black">
                Cancel Order
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground font-medium">
              We're sorry to see you cancel. Please let us know why you're
              cancelling your order.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-bold">
                Why are you cancelling? <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={setCancelReason} value={cancelReason}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CANCELLATION_REASONS.map((reason) => (
                    <SelectItem
                      key={reason}
                      value={reason}
                      className="rounded-lg"
                    >
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-bold">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Tell us more..."
                className="min-h-[100px] rounded-xl resize-none focus:ring-indigo-500"
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-800 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Note: Once cancelled, this action cannot be undone. Any refund
                (if applicable) will be processed according to our policy.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsCancelModalOpen(false)}
              className="font-bold rounded-xl flex-1 sm:flex-none"
            >
              Stay
            </Button>
            <Button
              onClick={handleCancelOrder}
              variant="destructive"
              className="font-bold rounded-xl px-8 shadow-lg shadow-red-500/20 flex-1 sm:flex-none"
              disabled={cancelOrderMutation.isPending || !cancelReason}
            >
              {cancelOrderMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      {reviewProduct && (
        <ReviewFormModal
          isOpen={!!reviewProduct}
          onClose={() => setReviewProduct(null)}
          productId={reviewProduct.id}
          productName={reviewProduct.title}
          productImage={reviewProduct.imageUrl}
        />
      )}
    </div>
  )
}

function ReviewButton({
  productId,
  onWriteReview,
}: {
  productId: string
  onWriteReview: () => void
}) {
  const { data: canReviewData, isLoading } = useQuery(
    orpc.review.canReview.queryOptions({
      input: { productId },
    }),
  )

  if (!canReviewData)
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />

  const canReview = (canReviewData as any)?.canReview
  const reason = (canReviewData as any)?.reason

  if (!canReview) {
    if (reason === 'ALREADY_REVIEWED') {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold py-1"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Reviewed
        </Badge>
      )
    }
    return null
  }

  return (
    <Button
      size="sm"
      onClick={onWriteReview}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 rounded-lg shadow-sm"
    >
      Write a Review
    </Button>
  )
}

function OrderProgress({ currentStatus }: { currentStatus: any }) {
  const steps = [
    { id: 'initial', label: 'Placed', icon: ShoppingBag },
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]

  // Map status to step index
  const getActiveIndex = (status: string) => {
    if (status === 'delivered') return 3
    if (status === 'shipped') return 2
    if (['confirmed', 'payment_received', 'processing'].includes(status))
      return 1
    if (['placed', 'awaiting_payment', 'payment_submitted'].includes(status))
      return 0
    return -1
  }

  const activeIdx = getActiveIndex(currentStatus)

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted =
            idx < activeIdx || (currentStatus === 'delivered' && idx === 3)
          const isActive = idx === activeIdx
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              <div
                className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg',
                  isCompleted
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/20'
                    : isActive
                      ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800',
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-[10px] sm:text-xs font-black uppercase tracking-wider',
                    isCompleted || isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400',
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="absolute top-6 left-[50%] right-[-50%] h-[2px] bg-slate-100 dark:bg-slate-800 -z-10">
                  <div
                    className={cn(
                      'h-full bg-indigo-600 transition-all duration-1000',
                      idx < activeIdx ? 'w-full' : 'w-0',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
