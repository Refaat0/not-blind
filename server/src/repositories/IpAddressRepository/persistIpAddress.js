// Author: Refaat
import database from "../../database/database.js";

export default function persistIpAdress(ipAddress) {
    try {
        const result = database.prepare("INSERT INTO ip_addresses (ip_address, country) VALUES (?, ?)").run(ipAddress.ip_address,ipAddress.country);
        return result;
    } catch (error) {
        throw error;
    }
}
