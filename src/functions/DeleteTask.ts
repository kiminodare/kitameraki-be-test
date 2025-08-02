// functions/DeleteTask.ts
import { app } from "@azure/functions";
import { withValidation } from "../lib/withValidation";
import { withMiddleware } from "../lib/withMiddleware";
import { fail, ok } from "../lib/response";
import { cosmosClient } from "../lib/cosmosClient";
import { RequestDeleteTaskDto, DeleteTaskDto } from "../dtos/RequestDeleteTask.dto";

const handler: TypedHandler<DeleteTaskDto, null> = async (input, req, ctx) => {
    const { id, organizationId } = input;

    try {
        const { resource } = await cosmosClient
            .database("TaskApp")
            .container("Tasks")
            .item(id, organizationId)
            .read();

        if (!resource) {
            return fail("Task not found", 404);
        }

        await cosmosClient
            .database("TaskApp")
            .container("Tasks")
            .item(id, organizationId)
            .delete();

        return ok(null, "Task deleted successfully");
    } catch (err: any) {
        ctx.error("Error deleting task", err);
        return fail("Failed to delete task", 500);
    }
};

app.http("DeleteTask", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestDeleteTaskDto, handler))
});
