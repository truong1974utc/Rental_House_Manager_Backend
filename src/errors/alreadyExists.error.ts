export class AlreadyExistsError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "AlreadyExistsError";
        this.statusCode = 409; // HTTP Conflict
    }
}