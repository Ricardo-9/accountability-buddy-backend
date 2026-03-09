// This file shows an example of how to create specific error handlers, such as duplicate emails, "unauthorized" errors, etc.

import { AppError } from "./AppError.js";

export class SpecificError extends AppError{
    constructor(){
        super(
            "CODE",
            "message",
            400
        )
    }
}