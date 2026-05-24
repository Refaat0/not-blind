// Author: Refaat
import { ValidationError } from "../utilities/Errors.js";

function logger(error, request) {
    return {
        timestamp: new Date().toISOString(),
        ip: request.ip, // lol
        method: request.method,
        path: request.path,
        name: error.name,
        message: error.message,
        stack: error.isOperational ? undefined : error.stack
    }
}

export default function (error, request, response, next) {
    const log = logger(error,request);
    console.log(log)

    response.status(error.status || 500).json({
        message: log.message || "Our servers went up in flames 🔥"
    })
}
