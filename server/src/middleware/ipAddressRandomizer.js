// Author: Refaat
import getRandomIpAddress from "../utilities/getRandomIpAddress.js"

export default function ipAddressRandomizer(request, response, next) {
    try {
        request.headers["x-forwarded-for"] = getRandomIpAddress();
        next();
    } catch (error) {
        next(error);
    }
}
