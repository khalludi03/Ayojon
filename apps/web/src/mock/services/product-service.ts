// Product Service - Based on PRD Section 7.7
// Adds simulated network delay for realistic UX

import { mockDb } from '../db';
import type { Category, DealProduct, Product, ProductFilters, Vendor } from '@/types';
import { randomDelay } from '@/lib/utils';

interface PaginatedResult<T> {
  data: Array<T>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    await mockDb.init();
    await randomDelay(200, 500);
    return mockDb.getProducts(filters);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await mockDb.init();
    await randomDelay(150, 300);
    return mockDb.getProductById(id);
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    await mockDb.init();
    await randomDelay(150, 300);
    return mockDb.getProductBySlug(slug);
  },

  async getTodayDeals(limit?: number): Promise<Array<DealProduct>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getTodayDeals(limit);
  },

  async getFlashDeals(limit?: number): Promise<Array<DealProduct>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getFlashDeals(limit);
  },

  async searchProducts(query: string, limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(100, 250);
    return mockDb.searchProducts(query, limit);
  },

  async getRelatedProducts(productId: string, limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(150, 300);
    return mockDb.getRelatedProducts(productId, limit);
  },

  async getNewArrivals(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getNewArrivals(limit);
  },

  async getTopRated(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getTopRated(limit);
  },

  async getBestSellers(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getBestSellers(limit);
  },

  async getFlashSale(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getFlashSale(limit);
  },

  async getHotDeals(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getHotDeals(limit);
  },

  async getForYou(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getForYou(limit);
  },

  async getFeaturedProducts(limit?: number): Promise<Array<Product>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getFeaturedProducts(limit);
  },
};

export const categoryService = {
  async getCategories(): Promise<Array<Category>> {
    await mockDb.init();
    await randomDelay(100, 200);
    return mockDb.getCategories();
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    await mockDb.init();
    await randomDelay(100, 200);
    return mockDb.getCategoryById(id);
  },
};

export const vendorService = {
  async getVendors(): Promise<Array<Vendor>> {
    await mockDb.init();
    await randomDelay(200, 400);
    return mockDb.getVendors();
  },

  async getVendorById(id: string): Promise<Vendor | undefined> {
    await mockDb.init();
    await randomDelay(150, 300);
    return mockDb.getVendorById(id);
  },
};
