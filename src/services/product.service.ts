import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repositories/product.repository.js';
import type { Product, CreateProductInput, UpdateProductInput, PublicProduct } from '../models/product.model.js';
import { NotFoundError, ValidationError } from '../errors/app-errors.js';

// Service layer contains business logic. Controllers delegate to services,
// and services delegate data access to repositories.
// Constructor injection: the repository is passed in, making the service testable.

export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getAllProducts(): Promise<PublicProduct[]> {
    const products = await this.productRepo.findAll();
    // Omit<Product, 'stock'> is enforced by the return type.
    // We destructure to remove `stock` before returning.
    return products.map(({ stock, ...publicFields }) => publicFields);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }
    return product;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    this.validateProductInput(input);

    const product: Product = {
      ...input,
      id: uuidv4(),
    };

    return this.productRepo.save(product);
  }

  // Partial<Omit<Product, 'id'>> — clients can send any subset of fields.
  async updateProduct(id: string, updates: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Product', id);
    }

    this.validateProductUpdates(updates);
    const updated = await this.productRepo.update(id, updates);
    // Non-null assertion is safe here because we verified existence above.
    return updated!;
  }

  async deleteProduct(id: string): Promise<void> {
    const deleted = await this.productRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Product', id);
    }
  }

  async searchProducts(query: string): Promise<PublicProduct[]> {
    const products = await this.productRepo.search(query);
    return products.map(({ stock, ...publicFields }) => publicFields);
  }

  async getProductsByCategory(category: string): Promise<PublicProduct[]> {
    const products = await this.productRepo.findByCategory(category);
    return products.map(({ stock, ...publicFields }) => publicFields);
  }

  // ── Private validation helpers ──────────────────
  // Lightweight manual validation as per the LLD — no validation libraries.

  private validateProductInput(input: CreateProductInput): void {
    if (!input.name?.trim()) {
      throw new ValidationError('Product name is required');
    }
    if (input.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }
    if (input.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }
  }

  private validateProductUpdates(updates: UpdateProductInput): void {
    if (updates.price !== undefined && updates.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }
    if (updates.stock !== undefined && updates.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new ValidationError('Product name cannot be empty');
    }
  }
}
