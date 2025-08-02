import { app } from "@azure/functions";
import { withValidation } from "../lib/withValidation";
import { withMiddleware } from "../lib/withMiddleware";
import { sanitize } from "../lib/sanitize";
import { ok, fail } from "../lib/response";
import { cosmosClient } from "../lib/cosmosClient";
import { RequestGetTaskDto, GetTaskInput } from "../dtos/RequestGetTask.dto";
import { TaskDto } from "../dtos/ResponseTask.dto";
import { z } from "zod";
import {getCombinedTaskSchema} from "../lib/getCombinedTaskSchema";

const handler: TypedHandler<GetTaskInput, z.infer<typeof TaskDto>> = async (
    input,
    _req,
    ctx
) => {
    const { id, organizationId } = input;

    const db = cosmosClient.database("TaskApp");
    const tasksContainer = db.container("Tasks");

    const response = await tasksContainer.item(id, organizationId).read();
    const resource = response.resource;

    if (!resource) {
        return fail("Task not found", 404);
    }

    const { schema: CombinedTaskSchema, normalize } = await getCombinedTaskSchema();

    const patchedResource = normalize([resource])[0];

    const validated = CombinedTaskSchema.safeParse(patchedResource);
    if (!validated.success) {
        ctx.warn("Validation failed for task:", JSON.stringify(patchedResource, null, 2));
        ctx.warn("Zod error:", JSON.stringify(validated.error.issues, null, 2));
        return fail("Invalid task data", 500);
    }

    return ok(sanitize(CombinedTaskSchema, validated.data), "Task fetched");
};

app.http("GetTask", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestGetTaskDto, handler)),
});
