// ────────────────────────────────────────────────────
// Type Aliases & Literal Types
// ────────────────────────────────────────────────────

// Union of string literal types constrains OrderStatus to only these exact values.
// Unlike an enum, this is purely a type — no runtime code is generated.
export type OrderStatus = 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

// Type alias for product categories. Easy to extend by adding more string literals.
export type ProductCategory = 'fruits' | 'vegetables' | 'dairy' | 'snacks' | 'beverages' | 'household';

// ────────────────────────────────────────────────────
// Generic API Response Wrapper
// ────────────────────────────────────────────────────

// Generic type alias: `T` is a type parameter that makes ApiResponse
// reusable for any data shape while preserving full type safety.
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// ────────────────────────────────────────────────────
// Pagination Types
// ────────────────────────────────────────────────────

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

// Generic interface: PaginatedResult<T> works for any entity type,
// ensuring the items array is always correctly typed.
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

// ────────────────────────────────────────────────────
// Entity Constraint
// ────────────────────────────────────────────────────

// This interface enforces that any entity stored in the generic repository
// must have a string `id`. Used as a type constraint on generics.
export interface Identifiable {
  readonly id: string;
}
