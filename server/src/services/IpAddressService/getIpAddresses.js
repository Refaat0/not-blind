// Author: Refaat
import IpAddressRepository from "../../repositories/IpAddressRepository/_.js";
import paginate from "../../utilities/paginate.js";

export default function getIpAddresses(filters, url) {
    try {
        // owo ..
        const page  = parseInt(filters.page,  10) || 1;
        const limit = parseInt(filters.limit, 10) || 16;

        // query the database
        const [result, total] = IpAddressRepository.getIpAddresses({ ...filters, page, limit });

        // build pagination object & bubble results to controller
        const pagination = paginate(result, total, page, limit, url);
        return [result, pagination];
    } catch (error) {
        throw error;
    }
}
