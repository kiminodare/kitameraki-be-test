// lib/setupCosmos.ts
import { cosmosClient } from "./cosmosClient";

export async function setupCosmos() {
    const dbId = "TaskApp";
    const containerId = "FormSettings";

    // 1. Ensure database exists
    const { database } = await cosmosClient.databases.createIfNotExists({ id: dbId });

    // 2. Ensure container exists with /id as partition key
    await database.containers.createIfNotExists({
        id: containerId,
        partitionKey: {
            paths: ["/id"]
        }
    });

    console.log(`[cosmos] ✔️ Ready: ${dbId}/${containerId}`);
}
