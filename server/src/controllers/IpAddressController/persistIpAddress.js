// Author: Refaat
import IpAddressService from "../../services/IpAddressService/_.js";

export default function persistIpAdress(request, response) {
    try {
        const result = IpAddressService.persistIpAddress(request.body);
        return response.status(200).json({ message: "Destination commander?" });
    } catch (error) {
        throw error;
    }
}
