class Base extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
    Error.captureStackTrace(this, this.constructor)
  }
}

class NotFondError extends Base {
  constructor() {
    super('NotFondError', 404)
    Error.captureStackTrace(this, this.constructor)
  }
}

class ForbridenError extends Base {
  constructor() {
    super('ForbridenError', 403)
    Error.captureStackTrace(this, this.constructor)
  }
}

class GoneError extends Base {
  constructor() {
    super('GoneError', 410)
    Error.captureStackTrace(this, this.constructor)
  }
}

class UnauthorizedError extends Base {
  constructor() {
    super('User UNAUTHORIZED', 401)
    Error.captureStackTrace(this, this.constructor)
  }
}

class ObjectNotFoundError extends Base {
  constructor() {
    super('ObjectNotFound', 422)
    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends Base {
  constructor() {
    super('ValidationError', 422)
    Error.captureStackTrace(this, this.constructor)
  }
}

class FieldValidationError extends ValidationError {
  constructor(fields) {
    super()
    this.fields = fields
    Error.captureStackTrace(this, this.constructor)
  }
}

class SearchError extends ValidationError {
  constructor(fields) {
    super()
    this.fields = fields
    Error.captureStackTrace(this, this.constructor)
  }
}

class MaliciousError extends Base {
  constructor() {
    super('MaliciusError', 418)
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  ValidationError,
  Base,
  FieldValidationError,
  NotFondError,
  ForbridenError,
  UnauthorizedError,
  MaliciousError,
  GoneError,
  SearchError,
  ObjectNotFoundError,
}
