// Author: Refaat
import IpAddressService from "../../services/IpAddressService/_.js";
import { ApplicationError } from "../../utilities/Errors.js";

export default function getIpAdressById(request, response) {
    try {
        const result = IpAddressService.getIpAddressById(request.params.id);
        if (result.length === 0) {
            throw new ApplicationError(404, `Cannot find an IP Address with the ID ${request.params.id}`);
            return response.status(404).json({ message: `Cannot find an IP Address with the ID '${request.params.id}'` });
        }

        return response.status(200).json(result);
    } catch (error) {
        throw error;
    }
}
