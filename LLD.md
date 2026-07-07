# Mini Zepto Backend (Learning Project)

## Low-Level Design (LLD)

### 1. Objective

Build a small but production-style backend application inspired by Zepto (quick-commerce), using **Node.js + TypeScript + Express**.

This project is **not** intended to be feature complete or production ready. Its primary objective is to serve as a learning project for an experienced JavaScript developer transitioning to TypeScript.

The generated code should prioritize:

* Clean architecture
* Readability
* Type safety
* Modern TypeScript best practices
* Separation of concerns
* Small, understandable files
* Extensive use of TypeScript language features where they naturally fit

Avoid unnecessary abstractions or enterprise-level complexity.

---

# 2. Learning Objectives

The project should intentionally demonstrate practical usage of:

* TypeScript configuration (`tsconfig.json`)
* ES Modules
* Interfaces
* Type aliases
* Union types
* Literal types
* Generic classes
* Generic functions
* Async/await with typed `Promise<T>`
* Utility types

  * `Partial`
  * `Pick`
  * `Omit`
  * `Record`
* Strongly typed Express Request/Response objects
* Proper folder organization
* Dependency injection where appropriate (constructor injection only)
* Error handling
* Custom Error classes
* Type inference
* Strict mode compatibility
* Reusable utility functions

The project should compile with:

```json
"strict": true
```

There should be **zero TypeScript compilation warnings**.

---

# 3. Tech Stack

* Node.js (latest LTS)
* TypeScript
* Express
* UUID package
* tsx (development)
* npm

No ORM.

No authentication.

No database.

No Docker.

No Redis.

No JWT.

No testing framework (optional bonus section later).

Use only an in-memory datastore.

---

# 4. Functional Scope

The backend represents a simplified quick-commerce application.

Modules:

* Products
* Cart
* Orders

Only REST APIs.

---

# 5. Folder Structure

```
src/

app.ts

server.ts

config/

routes/

controllers/

services/

repositories/

models/

types/

middleware/

errors/

utils/

data/

```

Keep each file under approximately 200 lines where practical.

---

# 6. Architecture

```
HTTP Request

↓

Routes

↓

Controller

↓

Service

↓

Repository

↓

In-memory Database
```

Business logic must never exist inside route definitions.

Controllers should remain thin.

Repositories should only manage data persistence.

Services should contain business rules.

---

# 7. Domain Models

## Product

Fields:

* id
* name
* description
* category
* price
* stock
* imageUrl
* isAvailable

---

## Cart Item

Fields:

* productId
* quantity

---

## Order

Fields:

* id
* items
* total
* createdAt
* status

Status should use a TypeScript Union Type.

Example:

```
"PLACED"
"PACKING"
"OUT_FOR_DELIVERY"
"DELIVERED"
```

Avoid enums unless necessary.

---

# 8. REST APIs

## Products

GET /products

Returns all products.

---

GET /products/:id

Returns one product.

---

POST /products

Create product.

---

PATCH /products/:id

Update product.

Must use:

```
Partial<Product>
```

---

DELETE /products/:id

Delete product.

---

## Cart

GET /cart

Returns current cart.

---

POST /cart/items

Add item.

---

PATCH /cart/items/:productId

Update quantity.

---

DELETE /cart/items/:productId

Remove item.

---

## Orders

POST /orders

Creates an order from the cart.

Reduce stock.

Clear cart.

---

GET /orders

List all orders.

---

GET /orders/:id

Get single order.

---

# 9. Repository Layer

Implement a reusable generic repository.

Example:

```
Repository<T>
```

Responsibilities:

* save
* update
* delete
* findById
* findAll

Do not duplicate repository logic for each entity.

The repository should be reusable for Product, Order and Cart.

---

# 10. TypeScript Features (Intentional Usage)

## Interfaces

Use for domain models.

Example:

```
interface Product
```

---

## Type Aliases

Use for:

* OrderStatus
* ProductCategory
* API response types

---

## Utility Types

### Partial

Updating Product

```
Partial<Product>
```

---

### Pick

Create lightweight Product Card response.

Example:

```
Pick<Product,
"name" | "price" | "imageUrl">
```

---

### Omit

Hide internal fields.

Example:

```
Omit<Product,
"stock">
```

Use when returning public product listings.

---

### Record

Maintain in-memory cache.

Example:

```
Record<string, Product>
```

---

# 11. Generic Functions

Implement reusable generic helper functions.

Examples:

```
groupBy()

paginate()

sortBy()

clone()

```

Generics should be used where they genuinely improve type safety.

Avoid artificial examples.

---

# 12. Async Programming

Even though data is in-memory, every repository/service method should be asynchronous.

Example:

```
Promise<Product[]>
```

Reason:

Allows easy replacement with a real database later.

---

# 13. Error Handling

Create custom error classes.

Examples:

```
NotFoundError

ValidationError

ConflictError
```

Implement Express error middleware.

Return proper HTTP status codes.

---

# 14. Validation

Do lightweight manual validation.

Example:

* price > 0
* stock >= 0
* quantity > 0

Do not introduce validation libraries.

---

# 15. Middleware

Implement:

Request logger

404 handler

Global error handler

---

# 16. Configuration

Provide a clean tsconfig.json.

Important options:

* strict
* rootDir
* outDir
* module = NodeNext
* moduleResolution = NodeNext
* target = ES2022

Explain every compiler option using comments in accompanying documentation (JSON itself cannot contain comments).

---

# 17. Coding Style

Use:

* async/await
* const whenever possible
* readonly where appropriate
* early returns
* small functions
* meaningful names
* no magic numbers

Avoid:

* any
* unnecessary type assertions
* long methods
* deeply nested logic

---

# 18. Documentation Requirements

For every major TypeScript feature introduced, include a short explanatory comment directly above the relevant code.

Example:

```ts
// Partial<T> makes every property optional.
// Useful for PATCH endpoints where clients only send changed fields.
```

Do not over-comment trivial code.

Focus comments on explaining *why* a TypeScript feature is being used.

---

# 19. Learning Notes

At the end of the project, create a `LEARNING_NOTES.md` containing:

* Folder structure explanation
* Request lifecycle
* How Express routing works
* Why controllers exist
* Why services exist
* Why repositories exist
* Explanation of every TypeScript feature used
* Common mistakes JavaScript developers make when moving to TypeScript
* Suggested improvements for a production-ready version

---

# 20. Stretch Goals (Optional)

If time permits, additionally implement:

* Product search
* Pagination
* Sorting
* Category filtering
* Inventory validation before checkout
* Request ID middleware
* Simple configuration service
* Health endpoint (`GET /health`)
* Generic API response wrapper
* Basic environment variable handling

These should remain optional and must not complicate the core learning objectives.

---

# Success Criteria

The finished project should feel like a small, well-organized production backend that an experienced JavaScript engineer can read in a few hours to understand how modern TypeScript is used in real applications. Every significant TypeScript feature should appear naturally in the codebase with clear, intentional examples, allowing the reader to learn through realistic implementation rather than isolated snippets.
