import type { VendorStoreSettings } from '@/types/vendor-store'

const STORAGE_KEY = 'ayojon_vendor_store_settings_v2'

// Default template for new vendors
const getDefaultSettings = (vendorId: string): VendorStoreSettings => ({
  id: `settings-${vendorId}`,
  vendorId,
  storeName: '',
  storeDescription: '',
  returnPolicy: '',
  shippingPolicy: '',
  cancellationPolicy: '',
  businessPhone: '',
  businessEmail: '',
  businessHours: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export function getVendorStoreSettings(vendorId: string): VendorStoreSettings {
  if (typeof window === 'undefined') return getDefaultSettings(vendorId)

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      const defaultSettings = getDefaultSettings(vendorId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultSettings]))
      return defaultSettings
    }

    const allSettings = JSON.parse(data) as Array<VendorStoreSettings>
    const settings = allSettings.find((s) => s.vendorId === vendorId)

    if (!settings) {
      const defaultSettings = getDefaultSettings(vendorId)
      allSettings.push(defaultSettings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
      return defaultSettings
    }

    return settings
  } catch (error) {
    console.error('Failed to get vendor store settings:', error)
    return getDefaultSettings(vendorId)
  }
}

export function updateVendorStoreSettings(
  vendorId: string,
  updates: Partial<VendorStoreSettings>,
): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    let allSettings: Array<VendorStoreSettings> = []

    if (data) {
      allSettings = JSON.parse(data)
    }

    const index = allSettings.findIndex((s) => s.vendorId === vendorId)

    if (index !== -1) {
      allSettings[index] = {
        ...allSettings[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    } else {
      allSettings.push({
        ...getDefaultSettings(vendorId),
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
  } catch (error) {
    console.error('Failed to update vendor store settings:', error)
  }
}
