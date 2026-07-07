import { BaseRepository } from './base.repository.js';
import type { Product } from '../models/product.model.js';
import { productStore } from '../data/store.js';

// ProductRepository extends the generic BaseRepository<Product>.
// The base class provides all CRUD operations automatically.
// This subclass can add product-specific queries if needed.
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    // Dependency injection: the in-memory store is passed to the base class.
    super(productStore);
  }

  // Product-specific query: filter by category.
  async findByCategory(category: string): Promise<Product[]> {
    const all = await this.findAll();
    return all.filter((product) => product.category === category);
  }

  // Product-specific query: search by name (case-insensitive).
  async search(query: string): Promise<Product[]> {
    const all = await this.findAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
    );
  }
}
