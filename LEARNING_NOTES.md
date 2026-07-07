# Learning Notes — Mini Zepto Backend

A companion guide for JavaScript developers learning TypeScript through a real backend project.

---

## Table of Contents

1. [Folder Structure Explained](#1-folder-structure-explained)
2. [Request Lifecycle](#2-request-lifecycle)
3. [How Express Routing Works](#3-how-express-routing-works)
4. [Why Controllers Exist](#4-why-controllers-exist)
5. [Why Services Exist](#5-why-services-exist)
6. [Why Repositories Exist](#6-why-repositories-exist)
7. [TypeScript Features Used](#7-typescript-features-used)
8. [Common Mistakes: JS → TS](#8-common-mistakes-js--ts)
9. [Suggested Improvements for Production](#9-suggested-improvements-for-production)

---

## 1. Folder Structure Explained

```
src/
├── app.ts                  # Express app creation & dependency wiring (composition root)
├── server.ts               # HTTP server bootstrap — separated from app for testability
├── config/
│   └── index.ts            # Centralized, typed configuration
├── types/
│   └── index.ts            # Shared type aliases, generics, and constraints
├── models/
│   ├── product.model.ts    # Product interface + utility types (Pick, Omit, Partial)
│   ├── cart.model.ts       # Cart and CartItem interfaces
│   └── order.model.ts      # Order interface with union-typed status
├── errors/
│   └── app-errors.ts       # Custom error class hierarchy
├── utils/
│   └── helpers.ts          # Generic utility functions (groupBy, paginate, sortBy, clone)
├── data/
│   ├── store.ts            # In-memory data stores using Record<string, T>
│   └── seed.ts             # Seed data for development
├── repositories/
│   ├── base.repository.ts  # Generic BaseRepository<T> — reusable CRUD
│   ├── product.repository.ts
│   └── order.repository.ts
├── services/
│   ├── product.service.ts  # Business logic for products
│   ├── cart.service.ts     # Cart management with stock validation
│   └── order.service.ts    # Checkout orchestration
├── controllers/
│   ├── product.controller.ts  # HTTP → Service bridge (thin)
│   ├── cart.controller.ts
│   └── order.controller.ts
├── routes/
│   ├── product.routes.ts   # URL → Controller handler mapping
│   ├── cart.routes.ts
│   └── order.routes.ts
└── middleware/
    ├── request-logger.ts   # Logs every incoming request
    ├── not-found.ts        # Catches unmatched routes (404)
    └── error-handler.ts    # Global error handler (catches thrown errors)
```

### Design Principles

- **One concern per file.** Each file does one thing and is typically under 100 lines.
- **Layered architecture.** Each layer only talks to the layer directly below it.
- **No circular dependencies.** Data flows downward: Routes → Controllers → Services → Repositories → Store.

---

## 2. Request Lifecycle

Here's what happens when a client sends `GET /products/abc123`:

```
1. Client sends HTTP request
        ↓
2. Express receives the request
        ↓
3. Global middleware runs (JSON parser, request logger)
        ↓
4. Express router matches GET /products/:id
        ↓
5. ProductController.getById() is called
        ↓
6. Controller calls ProductService.getProductById("abc123")
        ↓
7. Service calls ProductRepository.findById("abc123")
        ↓
8. Repository looks up the ID in the in-memory Record<string, Product>
        ↓
9. Data flows back up: Repository → Service → Controller
        ↓
10. Controller sends JSON response with res.json()
```

**On error:**

```
7. Service throws NotFoundError("Product", "abc123")
        ↓
8. Controller's catch block calls next(error)
        ↓
9. Express error middleware catches it
        ↓
10. globalErrorHandler checks: error instanceof AppError?
    → Yes: Returns { success: false, error: "Product with id 'abc123' not found" } with status 404
    → No:  Returns { success: false, error: "Internal server error" } with status 500
```

---

## 3. How Express Routing Works

Express routing in this project follows a **factory function pattern**:

```typescript
// routes/product.routes.ts
export function createProductRouter(controller: ProductController): Router {
  const router = Router();

  router.get('/', controller.getAll);       // GET /products
  router.get('/:id', controller.getById);   // GET /products/abc123
  router.post('/', controller.create);      // POST /products
  router.patch('/:id', controller.update);  // PATCH /products/abc123
  router.delete('/:id', controller.delete); // DELETE /products/abc123

  return router;
}
```

**Why factory functions instead of just exporting a router?**

- The controller is passed as a parameter, enabling dependency injection.
- No module-level side effects — the router is created on demand.
- Easy to test with mock controllers.

**Route mounting (in app.ts):**

```typescript
app.use('/products', createProductRouter(productController));
app.use('/cart', createCartRouter(cartController));
app.use('/orders', createOrderRouter(orderController));
```

The prefix (`/products`) is set when mounting. Route definitions inside only specify the relative path.

---

## 4. Why Controllers Exist

Controllers are the **translation layer** between HTTP and business logic:

| They DO                                    | They DON'T                        |
| ------------------------------------------ | --------------------------------- |
| Parse request params, body, query          | Contain business rules            |
| Call the appropriate service method         | Access the database/store         |
| Format and send the HTTP response           | Validate business constraints     |
| Catch errors and forward to error middleware | Know about other controllers      |

**Without controllers**, your route handlers would mix HTTP concerns with business logic, making code harder to test, read, and maintain.

---

## 5. Why Services Exist

Services are where **business rules live**:

- "Price must be greater than 0"
- "Cannot checkout with an empty cart"
- "Reduce stock when an order is placed"
- "Preserve the product price at order time"

**Why not put this in controllers?**

- Multiple controllers (or future CLI tools, cron jobs, etc.) might need the same business logic.
- Services are testable without HTTP — you can call them directly with plain objects.
- Separating HTTP from business logic keeps both simple.

---

## 6. Why Repositories Exist

Repositories abstract **data access**:

```
Service calls: repository.findById("abc123")
Repository handles: looking up in Record<string, Product>
```

**Key benefit: replaceability.** If you switch from in-memory to PostgreSQL, you change only the repository — services and controllers stay untouched.

The generic `BaseRepository<T extends Identifiable>` eliminates repetitive CRUD code. One class serves products, orders, and any future entity.

---

## 7. TypeScript Features Used

### 7.1 Interfaces

**File:** `models/product.model.ts`

```typescript
export interface Product extends Identifiable {
  readonly id: string;
  name: string;
  price: number;
  // ...
}
```

**Why interfaces?**
- Interfaces define the *shape* of data without generating runtime code.
- They're open for extension (`extends`), unlike `type` aliases.
- Ideal for domain models because they clearly express "this is the contract."

---

### 7.2 Type Aliases

**File:** `types/index.ts`

```typescript
export type OrderStatus = 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type ProductCategory = 'fruits' | 'vegetables' | 'dairy' | 'snacks' | 'beverages' | 'household';
```

**Why type aliases instead of enums?**
- No runtime code generated — purely compile-time.
- Works with string literals, which are the natural representation in JSON APIs.
- Easier to compose with unions and intersections.

---

### 7.3 Union Types & Literal Types

**File:** `types/index.ts`, `models/order.model.ts`

```typescript
type OrderStatus = 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

// In Order interface:
status: OrderStatus;  // Only these 4 exact strings are valid
```

**Why?**
- The compiler catches invalid values at build time:
  ```typescript
  order.status = 'SHIPPED';  // ❌ Compile error!
  order.status = 'DELIVERED'; // ✅ OK
  ```

---

### 7.4 Generic Classes

**File:** `repositories/base.repository.ts`

```typescript
export class BaseRepository<T extends Identifiable> {
  constructor(private readonly store: Record<string, T>) {}

  async findById(id: string): Promise<T | undefined> { /* ... */ }
  async save(entity: T): Promise<T> { /* ... */ }
}
```

**Why?**
- One repository class works for `Product`, `Order`, or any future entity.
- The `extends Identifiable` constraint ensures `T` always has an `id` field.
- TypeScript tracks the exact type: `ProductRepository.findById()` returns `Promise<Product | undefined>`, not `Promise<unknown>`.

---

### 7.5 Generic Functions

**File:** `utils/helpers.ts`

```typescript
export function sortBy<T>(items: readonly T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  // ...
}
```

**Why?**
- `<T>` preserves the input type. `sortBy(products, 'price')` returns `Product[]`, not `unknown[]`.
- `keyof T` constrains the `key` parameter to only valid property names, preventing typos.

---

### 7.6 Utility Types

#### `Partial<T>` — Make all properties optional

**File:** `models/product.model.ts`

```typescript
export type UpdateProductInput = Partial<Omit<Product, 'id'>>;
```

**Use case:** PATCH endpoints where clients send only the fields they want to change.

#### `Pick<T, K>` — Select specific properties

```typescript
export type ProductCard = Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;
```

**Use case:** Lightweight API responses (e.g., product listing cards).

#### `Omit<T, K>` — Remove specific properties

```typescript
export type PublicProduct = Omit<Product, 'stock'>;
```

**Use case:** Hide internal fields (stock) from public API responses.

#### `Record<K, V>` — Object type with typed keys and values

**File:** `data/store.ts`

```typescript
export const productStore: Record<string, Product> = {};
```

**Use case:** In-memory stores indexed by string ID. Also used in `groupBy()` return type.

---

### 7.7 Async/Await with Typed Promises

**File:** Every service and repository method

```typescript
async findById(id: string): Promise<Product | undefined> {
  // ...
}
```

**Why async when data is in-memory?**
- Real databases return Promises. Writing async now means zero refactoring when you add a real database.
- TypeScript enforces that callers `await` the result, preventing subtle bugs.

---

### 7.8 `readonly` Modifier

**Files:** `config/index.ts`, `types/index.ts`, `models/*.ts`

```typescript
// Properties that should never change after creation
export interface Order extends Identifiable {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly createdAt: Date;
  status: OrderStatus;  // Only status can change
}
```

**Why?**
- Communicates *intent*: "this field should not be modified after creation."
- The compiler prevents accidental mutation.
- Notice `status` is NOT readonly — it legitimately changes during order processing.

---

### 7.9 Strongly Typed Express Requests

**File:** `controllers/product.controller.ts`

```typescript
// Express Request has 4 generic parameters: <Params, ResBody, ReqBody, Query>
create = async (
  req: Request<object, object, CreateProductInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const product = await this.productService.createProduct(req.body);
  // req.body is typed as CreateProductInput — TypeScript checks field access!
};
```

**Why?**
- Without generics, `req.body` is `any`, losing all type safety.
- With generics, TypeScript knows exactly what shape `req.body` has.

---

### 7.10 Custom Error Classes with `instanceof` Narrowing

**File:** `errors/app-errors.ts`, `middleware/error-handler.ts`

```typescript
// Defining:
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(message, 404);  // Status code baked into the error
  }
}

// Using:
if (err instanceof AppError) {
  // TypeScript narrows: `err` is AppError, so `.statusCode` is accessible
  res.status(err.statusCode).json(errorResponse(err.message));
}
```

**Why?**
- `instanceof` is a *type guard* — TypeScript narrows the type inside the `if` block.
- Each error class carries its own HTTP status code, eliminating switch/case logic.

---

### 7.11 Constructor Parameter Properties

**File:** Every service, controller, and repository

```typescript
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}
  // Equivalent to:
  // private readonly productRepo: ProductRepository;
  // constructor(productRepo: ProductRepository) {
  //   this.productRepo = productRepo;
  // }
}
```

**Why?**
- TypeScript shorthand that declares + initializes a class field in one line.
- `private readonly` means: only accessible within this class, and never reassigned.

---

### 7.12 Type Inference

TypeScript infers types wherever possible. You write less, and the compiler fills in the rest:

```typescript
// Type of `products` is inferred as Product[] — no annotation needed
const products = await this.productRepo.findAll();

// Type of the return value is inferred from the object literal
export function successResponse<T>(data: T) {
  return { success: true as const, data };
}
```

**Rule of thumb:** Annotate function signatures (inputs/outputs). Let TypeScript infer local variables.

---

### 7.13 `as const` Assertions

**File:** `config/index.ts`, `utils/helpers.ts`

```typescript
return { success: true as const, data };
//                 ^^^^^^^^^^^^
// Without `as const`: type is `boolean`
// With `as const`: type is the literal `true`
```

**Why?**
- Narrows the type to the exact literal value.
- Useful for discriminated unions and precise return types.

---

### 7.14 Dependency Injection (Constructor Injection)

**File:** `app.ts` (composition root)

```typescript
const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);
```

**Why?**
- Dependencies are explicit — you can see what each class needs.
- Easy to swap implementations (e.g., test with a mock repository).
- No hidden global state or magic.

---

## 8. Common Mistakes: JS → TS

### ❌ Using `any` to silence errors

```typescript
// BAD
const data: any = req.body;

// GOOD
const data: CreateProductInput = req.body;
```

`any` disables type checking entirely. Use `unknown` if you truly don't know the type, then narrow it.

---

### ❌ Forgetting `.js` extensions in imports (with NodeNext)

```typescript
// BAD — will fail at runtime with ESM
import { Product } from '../models/product.model';

// GOOD
import { Product } from '../models/product.model.js';
```

With `module: "NodeNext"`, TypeScript follows Node.js ESM rules, which require file extensions in imports. You write `.js` even though the source file is `.ts`.

---

### ❌ Not using `strict: true`

Without strict mode, TypeScript misses critical bugs:
- `null` and `undefined` can be assigned to any type
- Function parameters can be implicitly `any`
- `this` type is not checked

**Always start with `strict: true`.** It enables ~7 strict flags at once.

---

### ❌ Over-typing (annotating what TypeScript already infers)

```typescript
// UNNECESSARY — TypeScript knows items is Product[]
const items: Product[] = await this.productRepo.findAll();

// BETTER — let inference do its job
const items = await this.productRepo.findAll();
```

Annotate function signatures. Let TypeScript infer the rest.

---

### ❌ Using enums when union types suffice

```typescript
// OVERLY COMPLEX for simple string values
enum OrderStatus { PLACED = 'PLACED', PACKING = 'PACKING' }

// SIMPLER — no runtime code, works naturally with JSON
type OrderStatus = 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
```

---

### ❌ Not handling `undefined` from lookups

```typescript
// BAD — might be undefined!
const product = store[id];
product.name; // 💥 Runtime error if id doesn't exist

// GOOD — check first
const product = store[id];
if (!product) throw new NotFoundError('Product', id);
product.name; // ✅ TypeScript knows it's defined
```

---

### ❌ Mutating imported objects

```typescript
// BAD — the caller can accidentally change the stored data
async findById(id: string): Promise<T | undefined> {
  return this.store[id]; // Returns reference to stored object!
}

// GOOD — return a clone
async findById(id: string): Promise<T | undefined> {
  const item = this.store[id];
  return item ? structuredClone(item) : undefined;
}
```

---

### ❌ Forgetting `Object.setPrototypeOf` in custom errors

```typescript
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    // Without this line, `instanceof NotFoundError` may return false
    // when targeting ES5 or when transpiling through certain tools.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
```

---

## 9. Suggested Improvements for Production

| Area | Current State | Production Improvement |
|------|---------------|----------------------|
| **Database** | In-memory `Record` | PostgreSQL with Prisma or Drizzle ORM |
| **Authentication** | None (single global cart) | JWT or session-based auth |
| **Validation** | Manual checks | Zod for schema validation |
| **Testing** | None | Vitest for unit/integration tests |
| **Logging** | `console.log` | Structured logging with Pino or Winston |
| **Error tracking** | Console output | Sentry for error monitoring |
| **API docs** | None | OpenAPI/Swagger specification |
| **Rate limiting** | None | express-rate-limit middleware |
| **CORS** | Not configured | cors middleware with allowed origins |
| **Environment** | Hardcoded defaults | dotenv with validation (Zod) |
| **Docker** | None | Dockerfile + docker-compose |
| **CI/CD** | None | GitHub Actions for lint, test, build |
| **Input sanitization** | None | Helmet middleware + input escaping |
| **Pagination** | Available but not wired | Wire `paginate()` into list endpoints |
| **Caching** | None | Redis for frequently accessed data |

### Architecture Improvements

1. **Add a proper DI container** — As the app grows, manual wiring in `app.ts` becomes unwieldy. Consider `tsyringe` or `inversify`.

2. **Add DTOs (Data Transfer Objects)** — Separate API request/response shapes from internal domain models more formally.

3. **Add repository interfaces** — Define `IProductRepository` interfaces, then implement them. This enables mocking in tests without depending on concrete classes.

4. **Add database transactions** — The current order flow (reduce stock → create order → clear cart) should be atomic.

5. **Add request IDs** — Assign a unique ID to each request for tracing through logs.

---

*This project demonstrates TypeScript in a realistic backend context. Every feature — generics, utility types, strict mode, interfaces — appears where it naturally fits, not as an artificial example. Read the code alongside this guide for the best learning experience.*
