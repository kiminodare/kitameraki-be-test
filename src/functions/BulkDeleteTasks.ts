// functions/BulkDeleteTasks.ts
import { app } from "@azure/functions";
import { withValidation } from "../lib/withValidation";
import { withMiddleware } from "../lib/withMiddleware";
import { fail, ok } from "../lib/response";
import { cosmosClient } from "../lib/cosmosClient";
import { DeleteTasksDto, RequestDeleteTasksDto } from "../dtos/RequestDeleteTasks.dto";

const handler: TypedHandler<DeleteTasksDto, null> = async (input, req, ctx) => {
    const { organizationId, ids } = input;

    try {
        const promises = ids.map((id) =>
            cosmosClient
                .database("TaskApp")
                .container("Tasks")
                .item(id, organizationId)
                .delete()
        );

        await Promise.all(promises);

        return ok(null, "Tasks deleted successfully");
    } catch (err: any) {
        ctx.error("Bulk delete error", err);
        return fail("Failed to delete tasks", 500);
    }
};

app.http("BulkDeleteTasks", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestDeleteTasksDto, handler))
});
