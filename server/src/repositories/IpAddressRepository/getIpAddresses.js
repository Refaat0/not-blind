// Author: Refaat
import database from "../../database/database.js";
import QueryBuilder from "../../utilities/QueryBuilder.js";

export default  function getIpAddresses(filters) {
    try {
        // deconstruction
        const { ipAddress, country, dateStart, dateEnd, order, direction, page, limit } = filters;

        // build a query for getting the COUNT(*) of the ip addresses
        const queryBuilder = new QueryBuilder();

        if (ipAddress)               queryBuilder.addCondition("ip_address", ipAddress);
        if (country)                 queryBuilder.addCondition("country",    country);
        if (dateStart && !dateEnd)   queryBuilder.addCondition("created_at", dateStart, ">=");
        if (dateEnd   && !dateStart) queryBuilder.addCondition("created_at", dateEnd,   "<=");
        if (dateStart && dateEnd)    queryBuilder.addRange("created_at",     dateStart, dateEnd);

        // im cloning this for later when I add ORDER BY, LIMIT, & OFFSET since those clauses dont work with COUNT(*)
        const qb = queryBuilder.clone();

        // get count
        const [clause, parameters] = queryBuilder.build();
        const totalStatement  = `SELECT COUNT(*) as total FROM ip_addresses ${clause}` 
        const total = database.prepare(totalStatement).all(...parameters);

        // get rows
        const [cl, pr] = qb.addOrder(order || "created_at", direction || "ASC").addPagination(limit,page-1).build();
        const resultStatement = `SELECT * FROM ip_addresses ${cl}`;
        const result = database.prepare(resultStatement).all(...pr);

        return [result, total];
    } catch(error) {
        throw error;
    }
}
