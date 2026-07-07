import type { OrderStatus, Identifiable } from '../types/index.js';
import type { CartItem } from './cart.model.js';

// OrderItem extends CartItem with price snapshot and computed line total.
// This preserves the price at the time of order, even if the product price changes later.
export interface OrderItem extends CartItem {
  readonly name: string;
  readonly priceAtOrder: number;
  readonly lineTotal: number;
}

// Order uses a union type (OrderStatus) for the status field.
// This ensures TypeScript catches invalid status values at compile time.
export interface Order extends Identifiable {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly createdAt: Date;
  status: OrderStatus;
}
