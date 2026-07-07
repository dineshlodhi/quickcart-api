// Custom error classes extend the built-in Error class.
// Each error type maps to an HTTP status code, enabling the error middleware
// to automatically return the correct status without switch/case logic.

export class AppError extends Error {
  // readonly prevents reassignment after construction — a TypeScript-only safeguard.
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    // Maintains correct prototype chain when extending built-in classes.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
