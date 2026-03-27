export class UnauthorizedError extends Error {
    statusCode: number;

    constructor(message: string = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401; // HTTP Unauthorized
    }
}
