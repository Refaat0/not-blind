// Author: Refaat
import { ValidationError } from "../utilities/Errors.js";

const validateSchematic = (schema, target="body") => {
    if (target !== "body" && target !== "query" && target !== "params") {
        throw new Error("Unexpected target. Must be 'body', 'query', or 'params'.");
    }

    return (request, response, next) => {
        // declare & initialize the result object
        const {error, value} = schema.validate(request[target], {
            abortEarly: false,
            stripUnknonw: true
        });

        // if error is not in the result object then the validation has passed
        if (!error) {
            request.body = value;
            next(); // success
        } else {
            const { message } = error.details[0];
            throw new ValidationError(400, message, error);

        }
    }
}

export default validateSchematic;
