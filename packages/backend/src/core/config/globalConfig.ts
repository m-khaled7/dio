import authConfig from "./auth.config.js";
import databaseConfig from "./database.config.js";
import loggerConfig from "./logger.config.js";

export default ()=>({  
    logger:loggerConfig,
    database:databaseConfig,
    auth:authConfig
})