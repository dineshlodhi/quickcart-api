import type { Identifiable } from '../types/index.js';

// CartItem represents a single item in the shopping cart.
export interface CartItem {
  readonly productId: string;
  quantity: number;
}

// Cart implements Identifiable so it can be stored in the generic repository.
// A single cart belongs to the session (simplified: one global cart).
export interface Cart extends Identifiable {
  readonly id: string;
  items: CartItem[];
}

// Input type for adding an item to the cart.
export interface AddToCartInput {
  readonly productId: string;
  readonly quantity: number;
}

// Input type for updating quantity of a cart item.
export interface UpdateCartItemInput {
  readonly quantity: number;
}
