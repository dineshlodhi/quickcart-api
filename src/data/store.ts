import type { Product } from '../models/product.model.js';
import type { Cart } from '../models/cart.model.js';
import type { Order } from '../models/order.model.js';

// Record<string, T> is a utility type that creates an object type
// with string keys and values of type T. It's ideal for in-memory
// stores where entities are looked up by their string ID.

export const productStore: Record<string, Product> = {};
export const orderStore: Record<string, Order> = {};

// The cart store holds a single global cart (simplified — no user auth).
// We initialize it with an empty cart so it's always available.
export const cartStore: Cart = {
  id: 'default-cart',
  items: [],
};
