import type { VendorProduct, ProductStatus } from '@/types/vendor-product';

const STORAGE_KEY = 'ayojon_vendor_products';

export function getVendorProducts(vendorId?: string): VendorProduct[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const products = JSON.parse(data) as VendorProduct[];

    if (vendorId) {
      return products.filter(p => p.vendorId === vendorId);
    }

    return products;
  } catch (error) {
    console.error('Failed to get vendor products:', error);
    return [];
  }
}

export function getVendorProductById(productId: string): VendorProduct | null {
  const products = getVendorProducts();
  return products.find(p => p.id === productId) || null;
}

export function addVendorProduct(product: VendorProduct): void {
  try {
    const products = getVendorProducts();
    products.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to add vendor product:', error);
  }
}

export function updateVendorProduct(productId: string, updates: Partial<VendorProduct>): void {
  try {
    const products = getVendorProducts();
    const index = products.findIndex(p => p.id === productId);

    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  } catch (error) {
    console.error('Failed to update vendor product:', error);
  }
}

export function deleteVendorProduct(productId: string): void {
  try {
    const products = getVendorProducts();
    const filtered = products.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete vendor product:', error);
  }
}

export function updateProductStatus(productId: string, status: ProductStatus): void {
  try {
    const products = getVendorProducts();
    const index = products.findIndex(p => p.id === productId);

    if (index !== -1) {
      products[index].status = status;
      products[index].updatedAt = new Date().toISOString();

      if (status === 'published' && !products[index].publishedAt) {
        products[index].publishedAt = new Date().toISOString();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  } catch (error) {
    console.error('Failed to update product status:', error);
  }
}

export function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AYJ-${timestamp}-${random}`;
}
