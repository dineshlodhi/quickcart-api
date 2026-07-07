import type { PaginatedResult } from '../types/index.js';

// ────────────────────────────────────────────────────
// Generic Utility Functions
// ────────────────────────────────────────────────────
// These functions use generics (<T>) to work with any data type
// while preserving full type safety — the compiler knows exactly
// what type flows in and out.

/**
 * Groups an array of items by a key extracted via the provided function.
 * Returns a Record<string, T[]> — the Record utility type maps
 * string keys to arrays of T.
 */
export function groupBy<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T[]> {
  // reduce with an explicit type annotation on the accumulator
  // ensures TypeScript understands the shape throughout the reduction.
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    // Nullish coalescing assignment: initialize array if it doesn't exist.
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Paginates an array of items.
 * Returns a PaginatedResult<T> — a generic interface that adapts
 * to whatever entity type is passed in.
 */
export function paginate<T>(items: readonly T[], page: number, limit: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  // Clamp page to valid range.
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (safePage - 1) * limit;
  const paginatedItems = items.slice(start, start + limit);

  return {
    items: paginatedItems,
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

/**
 * Sorts an array by a numeric or string property.
 * keyof T constrains the key parameter to only valid property names of T,
 * preventing typos and invalid field access at compile time.
 */
export function sortBy<T>(items: readonly T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  const sorted = [...items].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB;
    }
    return 0;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Creates a deep clone of an object using structured cloning.
 * The generic <T> ensures the return type matches the input type exactly.
 */
export function clone<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Wraps a successful API response in a standard format.
 */
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    ...(message && { message }),
  };
}

/**
 * Wraps an error API response in a standard format.
 */
export function errorResponse(error: string) {
  return {
    success: false as const,
    error,
  };
}
