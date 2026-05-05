import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Loader2, MapPin, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Division } from '@/lib/bd-locations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  BD_CITIES,
  BD_DIVISIONS,
  validateBDPhone,
  validateBDPostalCode,
} from '@/lib/bd-locations'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { orpc, orpcClient } from '@/utils/orpc'

interface SavedAddress {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  division: Division
  postalCode: string
  addressType: 'home' | 'office'
  isDefault: boolean
}

interface ShippingStepProps {
  onNext: () => void
  formData: {
    fullName: string
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    division: string
    postalCode: string
    addressType: 'home' | 'office'
    saveAddress: boolean
  }
  onFormChange: (field: string, value: string | boolean) => void
}

export function ShippingStep({
  onNext,
  formData,
  onFormChange,
}: ShippingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(true)
  const [availableCities, setAvailableCities] = useState<Array<string>>([])
  const [isSaving, setIsSaving] = useState(false)

  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  // Fetch addresses from backend if logged in
  const { data: backendAddresses = [], isLoading: isLoadingAddresses } =
    useQuery({
      ...orpc.address.listAddresses.queryOptions(),
      enabled: !!session,
    })

  // Mutation to add address
  const addAddressMutation = useMutation({
    mutationFn: (data: any) => orpcClient.address.addAddress(data), // Using direct client for manual trigger
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address', 'listAddresses'] })
      toast.success('Address saved to your account')
    },
    onError: (error) => {
      console.error('Failed to save address:', error)
      toast.error('Failed to save address to account')
    },
  } as any)

  // Computed saved addresses (backend or guest-local)
  const [guestAddresses, setGuestAddresses] = useState<Array<SavedAddress>>([])

  // Load guest addresses only if not logged in
  useEffect(() => {
    if (!session) {
      const saved = localStorage.getItem('guest-saved-addresses')
      if (saved) {
        try {
          setGuestAddresses(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse guest addresses', e)
        }
      }
    } else {
      setGuestAddresses([]) // Clear guest addresses if logged in
    }
  }, [session])

  const savedAddresses: Array<SavedAddress> = session
    ? backendAddresses.map((addr: any) => ({
        id: addr.id,
        fullName: addr.name,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        division: addr.state as Division,
        postalCode: addr.postalCode,
        addressType: addr.type,
        isDefault: addr.isDefault,
      }))
    : guestAddresses

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (savedAddresses.length > 0 && !formData.fullName && !selectedAddressId) {
      const defaultAddress = savedAddresses.find((addr) => addr.isDefault)
      if (defaultAddress) {
        handleUseSavedAddress(defaultAddress.id)
      } else if (savedAddresses.length > 0) {
        // If no default, select the first one
        handleUseSavedAddress(savedAddresses[0].id)
      }

      // If we have addresses, hide the new form by default
      if (savedAddresses.length > 0) {
        setShowNewAddressForm(false)
      }
    }
  }, [savedAddresses.length, session]) // simplified dependency

  // Update available cities when division changes
  useEffect(() => {
    if (formData.division) {
      const cities = BD_CITIES[formData.division as Division]
      setAvailableCities(cities)
      if (formData.city && !cities.includes(formData.city)) {
        onFormChange('city', '')
      }
    } else {
      setAvailableCities([])
    }
  }, [formData.division])

  // Validate form
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    // Email required for guest checkout
    if (!session && !formData.email.trim()) {
      newErrors.email = 'Email is required for guest checkout'
    } else if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validateBDPhone(formData.phone)) {
      newErrors.phone =
        'Please enter a valid Bangladesh phone number (e.g., 01712345678 or +8801712345678)'
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required'
    }

    if (!formData.division) {
      newErrors.division = 'Division is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (formData.postalCode && !validateBDPostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    setErrors(newErrors)
    setIsFormValid(Object.keys(newErrors).length === 0)
  }, [formData, session])

  // Need to import orpcClient for mutationFn if not available in closure
  // We'll assume orpcClient is imported from @/utils/orpc
  // But wait, I need to add the import to the top
  // I added `import { orpc } from "@/utils/orpc";` but I also need `orpcClient` if I use it in mutationFn
  // Or I can use `orpc.address.addAddress.mutationOptions()` if available, but let's stick to consistent usage.
  // Actually `useMutation(orpc.address.addAddress.mutationOptions())` is cleaner.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      return
    }

    setIsSaving(true)

    try {
      // Save address if checked
      if (formData.saveAddress) {
        if (session) {
          // Check limit
          if (savedAddresses.length >= 5) {
            toast.error(
              'Maximum 5 addresses allowed. Please manage addresses in your account.',
            )
            // Proceed without saving
          } else {
            // Save to backend
            // We can't use the mutation hook directly here as a function easily if we want to await it
            // So we'll use the client directly or use mutateAsync from the hook
            // But I didn't define the hook with mutateAsync exposed nicely, let's redefine above
            // Actually I did: const addAddressMutation = useMutation(...)

            await addAddressMutation.mutateAsync({
              name: formData.fullName,
              phone: formData.phone,
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2,
              city: formData.city,
              state: formData.division,
              postalCode: formData.postalCode,
              type: formData.addressType,
              country: 'Bangladesh',
              isDefault: savedAddresses.length === 0,
            })
          }
        } else {
          // Guest save to local storage
          const newAddress: SavedAddress = {
            id: `addr_${Date.now()}`,
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            division: formData.division as Division,
            postalCode: formData.postalCode,
            addressType: formData.addressType,
            isDefault: savedAddresses.length === 0,
          }
          const existing = [...guestAddresses, newAddress]
          localStorage.setItem(
            'guest-saved-addresses',
            JSON.stringify(existing),
          )
          setGuestAddresses(existing)
          toast.success('Address saved for future guest checkout')
        }
      }

      onNext()
    } catch (error) {
      // Error already handled in mutation
      // But we should probably still proceed or let user retry?
      // If saving fails, we probably shouldn't block checkout.
      // So we catch and proceed.
      console.error('Error in submit', error)
      onNext()
    } finally {
      setIsSaving(false)
    }
  }

  const handleUseSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId)
    const address = savedAddresses.find((a) => a.id === addressId)

    if (address) {
      onFormChange('fullName', address.fullName)
      onFormChange('phone', address.phone)
      onFormChange('addressLine1', address.addressLine1)
      onFormChange('addressLine2', address.addressLine2)
      onFormChange('division', address.division)
      onFormChange('city', address.city)
      onFormChange('postalCode', address.postalCode)
      onFormChange('addressType', address.addressType)
      setShowNewAddressForm(false)
    }
  }

  const handleAddNewAddress = () => {
    setSelectedAddressId('')
    setShowNewAddressForm(true)
    // Clear form
    onFormChange('fullName', '')
    onFormChange('phone', '')
    onFormChange('addressLine1', '')
    onFormChange('addressLine2', '')
    onFormChange('division', '')
    onFormChange('city', '')
    onFormChange('postalCode', '')
    onFormChange('addressType', 'home')
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/20 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-3">
            <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Shipping Information
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {savedAddresses.length > 0
                ? 'Use a saved address or add a new one'
                : 'Enter your delivery address details'}
            </p>
          </div>
        </div>
      </div>

      {/* Message for users with no saved addresses */}
      {savedAddresses.length === 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            📍 You don't have any saved addresses yet. Fill out the form below
            to add your first address. You can save it for future orders by
            checking the box at the bottom.
          </p>
        </div>
      )}

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-base font-semibold">Saved Addresses</Label>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {savedAddresses.length}{' '}
                {savedAddresses.length === 1 ? 'address' : 'addresses'}
              </span>
            </div>
            <a
              href="/account?section=addresses"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--primary))] hover:underline"
            >
              Manage Addresses
            </a>
          </div>
          <div className="grid gap-3">
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={cn(
                  'group relative flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all duration-200',
                  selectedAddressId === address.id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-md'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50',
                )}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={() => handleUseSavedAddress(address.id)}
                  className="sr-only"
                />
                {/* Radio indicator */}
                <div
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    selectedAddressId === address.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]',
                  )}
                >
                  {selectedAddressId === address.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-semibold text-[hsl(var(--foreground))]">
                      {address.fullName}
                    </p>
                    <span
                      className={cn(
                        'text-xs rounded-full px-2.5 py-0.5 font-medium',
                        address.addressType === 'home'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                      )}
                    >
                      {address.addressType === 'home' ? '🏠 Home' : '🏢 Office'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                    <p>
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p>
                      {address.city}, {address.division}
                      {address.postalCode && ` - ${address.postalCode}`}
                    </p>
                    <p className="flex items-center gap-1.5 pt-1">
                      <span>📞</span>
                      {address.phone}
                    </p>
                  </div>
                </div>

                {/* Selected indicator */}
                {selectedAddressId === address.id && (
                  <div className="absolute right-3 top-3 rounded-full bg-[hsl(var(--primary))] p-1">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </label>
            ))}
          </div>

          {!showNewAddressForm && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleAddNewAddress}
              className="mt-4 w-full border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          )}
        </div>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          {savedAddresses.length > 0 && (
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                New Address
              </span>
              <div className="h-px flex-1 bg-[hsl(var(--border))]" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Contact Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-1 text-sm font-semibold"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFormChange('fullName', e.target.value)
                    }
                    placeholder="Enter your full name"
                    className={
                      errors.fullName ? 'border-red-500 focus:ring-red-500' : ''
                    }
                    required
                  />
                  {errors.fullName && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <span className="text-base">⚠</span>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-1 text-sm font-semibold"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(/\D/g, '') // Only allow digits
                      if (value.length <= 11) {
                        onFormChange('phone', value)
                      }
                    }}
                    placeholder="01712345678"
                    pattern="[0-9]{11}"
                    minLength={11}
                    maxLength={11}
                    className={
                      errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 11-digit mobile number{' '}
                    {formData.phone && `(${formData.phone.length}/11)`}
                  </p>
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <span className="text-base">⚠</span>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email for guest checkout */}
              {!session && (
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-1 text-sm font-semibold"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFormChange('email', e.target.value)
                    }
                    placeholder="Enter your email address"
                    className={
                      errors.email ? 'border-red-500 focus:ring-red-500' : ''
                    }
                    required
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <span className="text-base">⚠</span>
                      {errors.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Delivery Address
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="addressLine1"
                  className="flex items-center gap-1 text-sm font-semibold"
                >
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onFormChange('addressLine1', e.target.value)
                  }
                  placeholder="Enter house/flat number and road name"
                  className={
                    errors.addressLine1
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }
                  required
                />
                {errors.addressLine1 && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <span className="text-base">⚠</span>
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2" className="text-sm font-semibold">
                  Address Line 2 (Optional)
                </Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onFormChange('addressLine2', e.target.value)
                  }
                  placeholder="Enter area, landmark, or nearby location (optional)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="division"
                    className="flex items-center gap-1 text-sm font-semibold"
                  >
                    Division <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="division"
                    value={formData.division}
                    onChange={(e) => onFormChange('division', e.target.value)}
                    className={cn(
                      'flex h-10 w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&:-webkit-autofill]:!bg-[hsl(var(--background))] [&:-webkit-autofill]:shadow-[0_0_0_100px_hsl(var(--background))_inset]',
                      errors.division
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[hsl(var(--border))]',
                    )}
                    required
                  >
                    <option value="">Select Division</option>
                    {BD_DIVISIONS.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                  {errors.division && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <span className="text-base">⚠</span>
                      {errors.division}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="flex items-center gap-1 text-sm font-semibold"
                  >
                    City <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => onFormChange('city', e.target.value)}
                    className={cn(
                      'flex h-10 w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&:-webkit-autofill]:!bg-[hsl(var(--background))] [&:-webkit-autofill]:shadow-[0_0_0_100px_hsl(var(--background))_inset]',
                      errors.city
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[hsl(var(--border))]',
                    )}
                    required
                    disabled={!formData.division}
                  >
                    <option value="">
                      {formData.division
                        ? 'Select City'
                        : 'Select division first'}
                    </option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <span className="text-base">⚠</span>
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-semibold">
                  Postal Code (Optional)
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onFormChange('postalCode', e.target.value)
                  }
                  placeholder="Enter postal code (e.g., 1200)"
                  maxLength={4}
                  className={
                    errors.postalCode
                      ? 'border-red-500 focus:ring-red-500 sm:w-1/2'
                      : 'sm:w-1/2'
                  }
                />
                {errors.postalCode && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <span className="text-base">⚠</span>
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            {/* Address Type Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1 text-sm font-semibold">
                Address Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                    formData.addressType === 'home'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50',
                  )}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="home"
                    checked={formData.addressType === 'home'}
                    onChange={(e) =>
                      onFormChange('addressType', e.target.value)
                    }
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      formData.addressType === 'home'
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]',
                    )}
                  >
                    {formData.addressType === 'home' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-2xl">🏠</span>
                  <span className="font-medium">Home</span>
                </label>

                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                    formData.addressType === 'office'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50',
                  )}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="office"
                    checked={formData.addressType === 'office'}
                    onChange={(e) =>
                      onFormChange('addressType', e.target.value)
                    }
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      formData.addressType === 'office'
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]',
                    )}
                  >
                    {formData.addressType === 'office' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-2xl">🏢</span>
                  <span className="font-medium">Office</span>
                </label>
              </div>
            </div>

            {/* Save Address Checkbox (only for logged-in users) */}
            {session && (
              <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--muted))]/30 to-transparent p-4">
                <Checkbox
                  id="saveAddress"
                  checked={formData.saveAddress}
                  onCheckedChange={(checked) =>
                    onFormChange('saveAddress', checked)
                  }
                  className="mt-0.5"
                />
                <div>
                  <Label
                    htmlFor="saveAddress"
                    className="cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    💾 Save this address for future orders
                  </Label>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Quick checkout next time with your saved addresses
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between sm:items-center">
              {savedAddresses.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewAddressForm(false)}
                  className="order-2 sm:order-1"
                >
                  ← Back to Saved Addresses
                </Button>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid}
                className="order-1 sm:order-2 sm:ml-auto"
              >
                Continue to Delivery →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Continue button when using saved address */}
      {!showNewAddressForm && selectedAddressId && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Ready to continue?
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Your items will be delivered to the selected address
              </p>
            </div>
            <Button onClick={onNext} size="lg" className="ml-4">
              Continue to Delivery →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
