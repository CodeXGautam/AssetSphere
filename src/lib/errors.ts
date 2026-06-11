/**
 * Base error class for all service-layer errors.
 * Provides a consistent error hierarchy for typed error handling
 * in route handlers and services.
 */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

/** Thrown when a requested resource does not exist. Maps to HTTP 404. */
export class NotFoundError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Thrown when an operation conflicts with existing state. Maps to HTTP 409. */
export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Thrown when the caller lacks permission to perform an operation. Maps to HTTP 403. */
export class ForbiddenError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Thrown when there is not enough inventory to fulfil a request. */
export class InsufficientInventoryError extends ConflictError {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientInventoryError";
  }
}

/** Thrown when an operation is attempted on a resource in an invalid state. */
export class InvalidStateError extends ConflictError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}
