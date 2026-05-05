export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'home' | 'office'
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateAddressInput {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'home' | 'office'
  isDefault?: boolean
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {
  id: string
}

export interface AddressFormData {
  name: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'home' | 'office'
}
