import type { ProductCategory, Identifiable } from '../types/index.js';

// Interface defines the shape of a Product entity.
// Interfaces are ideal for domain models because they are open for extension
// and produce no runtime JavaScript — they exist only for type checking.
export interface Product extends Identifiable {
  readonly id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl: string;
  isAvailable: boolean;
}

// Pick<T, K> creates a new type by selecting only the specified keys from T.
// Useful for API responses that return a lightweight product summary.
export type ProductCard = Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;

// Omit<T, K> creates a new type by removing the specified keys from T.
// Useful when returning public product listings where stock is internal data.
export type PublicProduct = Omit<Product, 'stock'>;

// Omit<Product, 'id'> removes the id field since the server generates it.
// This is the shape clients must provide when creating a new product.
export type CreateProductInput = Omit<Product, 'id'>;

// Partial<T> makes every property optional.
// Perfect for PATCH endpoints where clients only send the fields they want to change.
export type UpdateProductInput = Partial<Omit<Product, 'id'>>;
