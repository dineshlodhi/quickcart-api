import type { Cart, CartItem, AddToCartInput, UpdateCartItemInput } from '../models/cart.model.js';
import type { Product } from '../models/product.model.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { cartStore } from '../data/store.js';
import { NotFoundError, ValidationError } from '../errors/app-errors.js';
import { clone } from '../utils/helpers.js';

// CartService manages the global cart.
// Since there's only one cart (no auth), we work directly with cartStore.
// The product repository is injected to validate product existence and stock.

export class CartService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getCart(): Promise<Cart> {
    return clone(cartStore);
  }

  async addItem(input: AddToCartInput): Promise<Cart> {
    this.validateQuantity(input.quantity);

    const product = await this.getValidProduct(input.productId);
    this.checkStockAvailability(product, input.quantity);

    // Check if item already exists in cart.
    const existingItem = cartStore.items.find(
      (item) => item.productId === input.productId
    );

    if (existingItem) {
      // Update quantity if item already in cart.
      const newQuantity = existingItem.quantity + input.quantity;
      this.checkStockAvailability(product, newQuantity);
      existingItem.quantity = newQuantity;
    } else {
      // Add new item to cart.
      cartStore.items.push({
        productId: input.productId,
        quantity: input.quantity,
      });
    }

    return clone(cartStore);
  }

  async updateItemQuantity(productId: string, input: UpdateCartItemInput): Promise<Cart> {
    this.validateQuantity(input.quantity);

    const itemIndex = cartStore.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Cart item', productId);
    }

    const product = await this.getValidProduct(productId);
    this.checkStockAvailability(product, input.quantity);

    cartStore.items[itemIndex].quantity = input.quantity;
    return clone(cartStore);
  }

  async removeItem(productId: string): Promise<Cart> {
    const itemIndex = cartStore.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Cart item', productId);
    }

    cartStore.items.splice(itemIndex, 1);
    return clone(cartStore);
  }

  // Returns the current items and clears the cart — used during checkout.
  async clearCart(): Promise<CartItem[]> {
    const items = clone(cartStore.items);
    cartStore.items = [];
    return items;
  }

  // ── Private helpers ──────────────────────────────

  private async getValidProduct(productId: string): Promise<Product> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }
    if (!product.isAvailable) {
      throw new ValidationError(`Product '${product.name}' is currently unavailable`);
    }
    return product;
  }

  private checkStockAvailability(product: Product, quantity: number): void {
    if (quantity > product.stock) {
      throw new ValidationError(
        `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`
      );
    }
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('Quantity must be a positive integer');
    }
  }
}
