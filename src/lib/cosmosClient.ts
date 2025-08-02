import { CosmosClient } from "@azure/cosmos";
import { config } from "./config.js";

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export const cosmosClient = new CosmosClient(config.cosmos.connectionString);
