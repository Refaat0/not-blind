// Author: Refaat
import IpAddressRepository from "../../repositories/IpAddressRepository/_.js";

export default function persistIpAdress(ipAddress) {
    try {
        const result = IpAddressRepository.persistIpAddress(ipAddress);
        return result;
    } catch (error) {
        throw error;
    }
}
