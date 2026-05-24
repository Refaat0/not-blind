/**
 * Bare-Bones Query Builder! And its' my first time using the Builder pattern :)
 * this.order & this.page are seperate from this.conditions because they cant be joined with the 'AND' clause in SQL
 * I am aware that concatinating using defined conditions leads to SQL injections however my application has sanitizaiton middleware
 * I should probably still have my QueryBuilder hold a whitelist of columns 
 */
export default class QueryBuilder {
    constructor(table) {
        this.table=table;
        this.conditions=[];
        this.parameters=[];
        this.order="";
        this.page="";
    }
    
    addCondition(condition, parameter, operator="=") {
        this.parameters.push(parameter);
        this.conditions.push(`${condition} ${operator} ?`);
        return this;
    }

    addRange(condition, lower, upper) { 
        this.parameters.push(lower,upper);
        this.conditions.push(`${condition} BETWEEN ? AND ?`);
        return this;
    }

    addOrder(column, order = "ASC") {
        this.order = `ORDER BY ${column} ${order}`;
        return this;
    }

    addPagination(limit, page) {
        const offset = limit*page;
        this.parameters.push(limit, offset);
        this.page = "LIMIT ? OFFSET ?";
        return this;
    }

    clone() {
        const clone = new QueryBuilder();
        clone.table = this.table;
        clone.conditions = [...this.conditions];
        clone.parameters = [...this.parameters];
        clone.order = this.order;
        clone.page = this.page;
        return clone;
    }

    build() {
        // if (this.conditions.length <= 0 && this.page==="" && this.order==="") {
        //     return [null, []];
        // }
        let query = "";

        // build where 
        if (this.conditions.length > 0) {
            query += "WHERE ";
            query += this.conditions.join(" AND ");
        }

        // build order
        if (this.order !== "") query += ` ${this.order}`;

        // build page
        query += ` ${this.page}`;

        return  [ query, this.parameters ];
    }
}
