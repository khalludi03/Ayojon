// Category Seed Data - Based on PRD Section 4.4.2 & 7.5

import type { Category, CategoryIconName } from '@/types';

export const CATEGORIES: Array<Category> = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone' as CategoryIconName,
    subcategories: [
      { id: 'mobile-phones', name: 'Mobile Phones', slug: 'mobile-phones', parentId: 'electronics' },
      { id: 'laptops', name: 'Laptops', slug: 'laptops', parentId: 'electronics' },
      { id: 'audio', name: 'Audio & Headphones', slug: 'audio', parentId: 'electronics' },
      { id: 'cameras', name: 'Cameras', slug: 'cameras', parentId: 'electronics' },
      { id: 'tablets', name: 'Tablets', slug: 'tablets', parentId: 'electronics' },
      { id: 'accessories', name: 'Accessories', slug: 'accessories', parentId: 'electronics' },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt' as CategoryIconName,
    subcategories: [
      { id: 'mens-clothing', name: "Men's Clothing", slug: 'mens-clothing', parentId: 'fashion' },
      { id: 'womens-clothing', name: "Women's Clothing", slug: 'womens-clothing', parentId: 'fashion' },
      { id: 'kids-clothing', name: "Kids' Clothing", slug: 'kids-clothing', parentId: 'fashion' },
      { id: 'traditional-wear', name: 'Traditional Wear', slug: 'traditional-wear', parentId: 'fashion' },
      { id: 'footwear', name: 'Footwear', slug: 'footwear', parentId: 'fashion' },
      { id: 'watches', name: 'Watches', slug: 'watches', parentId: 'fashion' },
    ],
  },
  {
    id: 'home',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Home' as CategoryIconName,
    subcategories: [
      { id: 'furniture', name: 'Furniture', slug: 'furniture', parentId: 'home' },
      { id: 'kitchen', name: 'Kitchen & Dining', slug: 'kitchen', parentId: 'home' },
      { id: 'bedding', name: 'Bedding', slug: 'bedding', parentId: 'home' },
      { id: 'decor', name: 'Home Decor', slug: 'decor', parentId: 'home' },
      { id: 'lighting', name: 'Lighting', slug: 'lighting', parentId: 'home' },
      { id: 'storage', name: 'Storage & Organization', slug: 'storage', parentId: 'home' },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: 'Sparkles' as CategoryIconName,
    subcategories: [
      { id: 'skincare', name: 'Skincare', slug: 'skincare', parentId: 'beauty' },
      { id: 'makeup', name: 'Makeup', slug: 'makeup', parentId: 'beauty' },
      { id: 'haircare', name: 'Hair Care', slug: 'haircare', parentId: 'beauty' },
      { id: 'fragrance', name: 'Fragrance', slug: 'fragrance', parentId: 'beauty' },
      { id: 'supplements', name: 'Supplements', slug: 'supplements', parentId: 'beauty' },
      { id: 'personal-care', name: 'Personal Care', slug: 'personal-care', parentId: 'beauty' },
    ],
  },
  {
    id: 'books',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    icon: 'BookOpen' as CategoryIconName,
    subcategories: [
      { id: 'bengali-books', name: 'Bengali Books', slug: 'bengali-books', parentId: 'books' },
      { id: 'english-books', name: 'English Books', slug: 'english-books', parentId: 'books' },
      { id: 'islamic-books', name: 'Islamic Books', slug: 'islamic-books', parentId: 'books' },
      { id: 'academic', name: 'Academic', slug: 'academic', parentId: 'books' },
      { id: 'office-supplies', name: 'Office Supplies', slug: 'office-supplies', parentId: 'books' },
      { id: 'art-supplies', name: 'Art Supplies', slug: 'art-supplies', parentId: 'books' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: 'Dumbbell' as CategoryIconName,
    subcategories: [
      { id: 'fitness', name: 'Fitness Equipment', slug: 'fitness', parentId: 'sports' },
      { id: 'cricket', name: 'Cricket', slug: 'cricket', parentId: 'sports' },
      { id: 'football', name: 'Football', slug: 'football', parentId: 'sports' },
      { id: 'badminton', name: 'Badminton', slug: 'badminton', parentId: 'sports' },
      { id: 'cycling', name: 'Cycling', slug: 'cycling', parentId: 'sports' },
      { id: 'camping', name: 'Camping & Hiking', slug: 'camping', parentId: 'sports' },
    ],
  },
  {
    id: 'grocery',
    name: 'Grocery',
    slug: 'grocery',
    icon: 'ShoppingBasket' as CategoryIconName,
    subcategories: [
      { id: 'staples', name: 'Staples', slug: 'staples', parentId: 'grocery' },
      { id: 'snacks', name: 'Snacks & Beverages', slug: 'snacks', parentId: 'grocery' },
      { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', parentId: 'grocery' },
      { id: 'halal', name: 'Halal Products', slug: 'halal', parentId: 'grocery' },
      { id: 'organic', name: 'Organic', slug: 'organic', parentId: 'grocery' },
      { id: 'frozen', name: 'Frozen Foods', slug: 'frozen', parentId: 'grocery' },
    ],
  },
  {
    id: 'baby',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    icon: 'Baby' as CategoryIconName,
    subcategories: [
      { id: 'toys', name: 'Toys', slug: 'toys', parentId: 'baby' },
      { id: 'baby-clothing', name: 'Baby Clothing', slug: 'baby-clothing', parentId: 'baby' },
      { id: 'feeding', name: 'Feeding', slug: 'feeding', parentId: 'baby' },
      { id: 'diapers', name: 'Diapers & Wipes', slug: 'diapers', parentId: 'baby' },
      { id: 'school-supplies', name: 'School Supplies', slug: 'school-supplies', parentId: 'baby' },
      { id: 'baby-gear', name: 'Baby Gear', slug: 'baby-gear', parentId: 'baby' },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    icon: 'Car' as CategoryIconName,
    subcategories: [
      { id: 'car-accessories', name: 'Car Accessories', slug: 'car-accessories', parentId: 'automotive' },
      { id: 'motorcycle', name: 'Motorcycle Parts', slug: 'motorcycle', parentId: 'automotive' },
      { id: 'car-care', name: 'Car Care', slug: 'car-care', parentId: 'automotive' },
      { id: 'tools', name: 'Tools & Equipment', slug: 'tools', parentId: 'automotive' },
      { id: 'oils-fluids', name: 'Oils & Fluids', slug: 'oils-fluids', parentId: 'automotive' },
      { id: 'electronics-auto', name: 'Auto Electronics', slug: 'electronics-auto', parentId: 'automotive' },
    ],
  },
  {
    id: 'digital',
    name: 'Digital Products',
    slug: 'digital-products',
    icon: 'Download' as CategoryIconName,
    subcategories: [
      { id: 'gift-cards', name: 'Gift Cards', slug: 'gift-cards', parentId: 'digital' },
      { id: 'software', name: 'Software', slug: 'software', parentId: 'digital' },
      { id: 'online-courses', name: 'Online Courses', slug: 'online-courses', parentId: 'digital' },
      { id: 'gaming', name: 'Gaming', slug: 'gaming', parentId: 'digital' },
      { id: 'streaming', name: 'Streaming', slug: 'streaming', parentId: 'digital' },
      { id: 'ebooks', name: 'E-Books', slug: 'ebooks', parentId: 'digital' },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

export function getAllSubcategories(): Array<{ id: string; name: string; parentId: string }> {
  return CATEGORIES.flatMap((cat) => cat.subcategories);
}
