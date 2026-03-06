export class AppError extends Error {
    code: string
    statusCode: number
    details?: unknown

    constructor(
        code: string,
        message: string,
        statusCode = 400,
        details?: unknown,
    ){
        super(message)

        this.code = code
        this.statusCode = statusCode
        this.details = details

        Object.setPrototypeOf(this, new.target.prototype)
    }
}