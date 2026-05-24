// Author: Refaat
import IpAddressService from "../../services/IpAddressService/_.js";
import getUrlFromRequest from "../../utilities/getUrlFromRequest.js";

export default function getIpAddresses(request, response) {
    try {
        const url = getUrlFromRequest(request);
        const [result, pagination] = IpAddressService.getIpAddresses(request.query, url);

        return response.status(200).json({ pagination, result });
    } catch (error) {
        throw error;
    }
}
