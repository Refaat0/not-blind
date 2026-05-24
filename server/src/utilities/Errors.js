// Author: Refaat
export class ApplicationError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export class ValidationError extends ApplicationError {
    constructor(status, message, details) {
        super(status, message);
        this.details = details;
    }
}

export class ResourceNotFoundError extends ApplicationError {
    constructor(message) {
        super(404, message);
    }
}