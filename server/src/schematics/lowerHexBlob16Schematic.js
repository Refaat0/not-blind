// Author: Refaat
import Joi from "joi";

export default Joi.object({
    // id: Joi.string().uuid({ version: ["uuidv4"] }),
    id: Joi.string().hex().lowercase().length(32)
});
