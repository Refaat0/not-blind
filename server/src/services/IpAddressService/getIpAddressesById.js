// Author: Refaat
import IpAddressRepository from "../../repositories/IpAddressRepository/_.js";

export default function getIpAdressById(id) {
    try {
        const result = IpAddressRepository.getIpAddressById(id);
        return result;
    } catch (error) {
        throw error;
    }
}
