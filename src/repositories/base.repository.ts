import type { Identifiable } from '../types/index.js';
import { clone } from '../utils/helpers.js';

// ────────────────────────────────────────────────────
// Generic Class: BaseRepository<T>
// ────────────────────────────────────────────────────
// A generic class parameterized by <T extends Identifiable>.
//
// The `extends Identifiable` constraint means T must have an `id: string`.
// This allows the repository to index, find, and delete items by ID
// without knowing the concrete entity type.
//
// One class serves Products, Orders, and any future entity —
// eliminating code duplication while keeping full type safety.

export class BaseRepository<T extends Identifiable> {
  // The store is injected via the constructor (dependency injection).
  // This decouples the repository from any specific data source.
  constructor(private readonly store: Record<string, T>) {}

  // All methods return Promises even though data is in-memory.
  // This mirrors real database APIs, making it trivial to swap
  // in a real database later without changing service code.

  async findAll(): Promise<T[]> {
    return Object.values(this.store).map(clone);
  }

  async findById(id: string): Promise<T | undefined> {
    const item = this.store[id];
    // Return a clone to prevent external mutation of stored data.
    return item ? clone(item) : undefined;
  }

  async save(entity: T): Promise<T> {
    this.store[entity.id] = clone(entity);
    return clone(entity);
  }

  // Partial<T> allows updating only some fields of the entity.
  // The `id` is required to locate the record; the rest are optional.
  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const existing = this.store[id];
    if (!existing) return undefined;

    // Spread merges the existing entity with only the provided updates.
    const updated = { ...existing, ...updates, id } as T;
    this.store[id] = updated;
    return clone(updated);
  }

  async delete(id: string): Promise<boolean> {
    if (!(id in this.store)) return false;
    delete this.store[id];
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return id in this.store;
  }
}
