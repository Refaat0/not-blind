// Author: Refaat
import database from "../../database/database.js";

export default function getIpAdressById(id) {
    try {
        const result = database.prepare("SELECT * FROM ip_addresses WHERE id = ?").all(id);
        return result;
    } catch (error) {
        throw error;
    }
}
