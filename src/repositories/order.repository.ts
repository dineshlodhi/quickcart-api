import { BaseRepository } from './base.repository.js';
import type { Order } from '../models/order.model.js';
import { orderStore } from '../data/store.js';

// OrderRepository inherits all CRUD from BaseRepository<Order>.
export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(orderStore);
  }
}
