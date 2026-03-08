export class AppError extends Error {
    code: string
    statusCode: number

    constructor(
        code: string,
        message: string,
        statusCode = 400,
    ){
        super(message)

        this.code = code
        this.statusCode = statusCode

        Object.setPrototypeOf(this, new.target.prototype)
    }
}