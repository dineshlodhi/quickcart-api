import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../repositories/order.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { CartService } from './cart.service.js';
import type { Order, OrderItem } from '../models/order.model.js';
import { NotFoundError, ValidationError } from '../errors/app-errors.js';

// OrderService orchestrates the checkout flow:
// 1. Read cart items
// 2. Validate stock for each item
// 3. Create order with price snapshots
// 4. Reduce product stock
// 5. Clear the cart

export class OrderService {
  // Constructor injection: all dependencies are provided externally.
  // This makes the service loosely coupled and easier to test.
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly cartService: CartService
  ) {}

  async createOrder(): Promise<Order> {
    const cart = await this.cartService.getCart();

    if (cart.items.length === 0) {
      throw new ValidationError('Cannot create order from an empty cart');
    }

    // Build order items with price snapshots.
    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const product = await this.productRepo.findById(cartItem.productId);

      if (!product) {
        throw new NotFoundError('Product', cartItem.productId);
      }
      if (cartItem.quantity > product.stock) {
        throw new ValidationError(
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${cartItem.quantity}`
        );
      }

      const lineTotal = product.price * cartItem.quantity;

      orderItems.push({
        productId: cartItem.productId,
        name: product.name,
        quantity: cartItem.quantity,
        priceAtOrder: product.price,
        lineTotal,
      });

      total += lineTotal;

      // Reduce stock in the product store.
      await this.productRepo.update(product.id, {
        stock: product.stock - cartItem.quantity,
      });
    }

    // OrderStatus is a union type — only 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    // are valid. Assigning any other string would be a compile-time error.
    const order: Order = {
      id: uuidv4(),
      items: orderItems,
      total,
      createdAt: new Date(),
      status: 'PLACED',
    };

    await this.cartService.clearCart();
    return this.orderRepo.save(order);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundError('Order', id);
    }
    return order;
  }
}
