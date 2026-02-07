import type { VendorStoreSettings } from '@/types/vendor-store';

const STORAGE_KEY = 'ayojon_vendor_store_settings';

// Default template for new vendors
const getDefaultSettings = (vendorId: string): VendorStoreSettings => ({
  id: `settings-${vendorId}`,
  vendorId,
  storeName: 'My Store',
  storeDescription: 'Welcome to my store! We offer high-quality products for all your needs.',
  returnPolicy:
    'We accept returns within 30 days of purchase. Items must be unused and in original packaging. Refunds will be processed within 5-7 business days.',
  shippingPolicy:
    'We ship nationwide within 3-5 business days. Express shipping available for an additional fee. Free shipping on orders over ৳2000.',
  cancellationPolicy:
    'Orders can be cancelled within 24 hours of placement. After 24 hours, cancellation may not be possible if the order has been processed.',
  businessPhone: '',
  businessEmail: '',
  businessHours: 'Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function getVendorStoreSettings(vendorId: string): VendorStoreSettings {
  if (typeof window === 'undefined') return getDefaultSettings(vendorId);

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const defaultSettings = getDefaultSettings(vendorId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultSettings]));
      return defaultSettings;
    }

    const allSettings = JSON.parse(data) as VendorStoreSettings[];
    const settings = allSettings.find((s) => s.vendorId === vendorId);

    if (!settings) {
      const defaultSettings = getDefaultSettings(vendorId);
      allSettings.push(defaultSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      return defaultSettings;
    }

    return settings;
  } catch (error) {
    console.error('Failed to get vendor store settings:', error);
    return getDefaultSettings(vendorId);
  }
}

export function updateVendorStoreSettings(
  vendorId: string,
  updates: Partial<VendorStoreSettings>
): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let allSettings: VendorStoreSettings[] = [];

    if (data) {
      allSettings = JSON.parse(data);
    }

    const index = allSettings.findIndex((s) => s.vendorId === vendorId);

    if (index !== -1) {
      allSettings[index] = {
        ...allSettings[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } else {
      allSettings.push({
        ...getDefaultSettings(vendorId),
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Failed to update vendor store settings:', error);
  }
}
