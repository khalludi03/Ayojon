// Category Types - Based on PRD Section 4.4.2 & 7.5

export type CategoryIconName =
  | 'Smartphone'
  | 'Shirt'
  | 'Home'
  | 'Sparkles'
  | 'BookOpen'
  | 'Dumbbell'
  | 'ShoppingBasket'
  | 'Baby'
  | 'Car'
  | 'Download';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconName;
  subcategories: Array<Subcategory>;
  productCount?: number;
  imageUrl?: string;
}
