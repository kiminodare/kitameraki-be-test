// functions/UpdateTask.ts
import {app} from "@azure/functions";
import {fail, ok} from "../lib/response";
import {withMiddleware} from "../lib/withMiddleware";
import {cosmosClient} from "../lib/cosmosClient";
import {RequestUpdateTaskDto} from "../dtos/RequestUpdateTaskDto";
import {generateZodFromFields} from "../lib/generateZodFromFormSettings";
import {FormSettings} from "../types/formSettings.types";
import {PatchOperation} from "@azure/cosmos";
import {mergeSchemas} from "../lib/mergeSchemas";
import {formatZodErrors} from "../lib/formatZodErrors";

const handler: TypedHandler<unknown, null> = async (_, req, ctx) => {
    const body = await req.json();

    let schema = RequestUpdateTaskDto;

    try {
        const {resource: settings} = await cosmosClient
            .database("TaskApp")
            .container("FormSettings")
            .item("form-settings", "form-settings")
            .read<FormSettings>();

        if (settings?.fields?.length) {
            const dynamicSchema = generateZodFromFields(settings.fields).partial(); // patch = optional
            schema = mergeSchemas(RequestUpdateTaskDto, dynamicSchema.shape);
        } else {
            ctx.warn("No fields found in FormSettings. Using fallback schema.");
        }
    } catch (err) {
        ctx.warn("Dynamic schema load failed or not found — fallback to DTO", {
            error: err instanceof Error ? err.message : err,
        });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        const issues = formatZodErrors(parsed.error);
        ctx.warn("Validation failed", issues);
        return fail("Validation failed", 400, issues);
    }

    const input = parsed.data;
    const {id, organizationId, ...updates} = input;

    if (!id || !organizationId) {
        return fail("Missing 'id' or 'organizationId'", 400);
    }

    if (Object.keys(updates).length === 0) {
        return fail("No update fields provided", 400);
    }

    let existingDoc: Record<string, unknown>;

    try {
        const {resource} = await cosmosClient
            .database("TaskApp")
            .container("Tasks")
            .item(id, organizationId)
            .read();

        if (!resource) {
            return fail("Task not found", 404);
        }

        existingDoc = resource;
    } catch (err) {
        ctx.error("Failed to fetch existing task", err);
        return fail("Task not found", 404);
    }

    const patchRequests: PatchOperation[] = Object.entries(updates).map(
        ([key, value]) => ({
            op: key in existingDoc ? "replace" : "add",
            path: `/${key}`,
            value,
        })
    );

    try {
        const {resource} = await cosmosClient
            .database("TaskApp")
            .container("Tasks")
            .item(id, organizationId)
            .patch(patchRequests);

        if (!resource) {
            return fail("Task not found after patch", 404);
        }

        return ok(null, "Task updated successfully");
    } catch (err: any) {
        ctx.error("Update task error", err);
        return fail("Failed to update task", 500);
    }
};

const adaptedHandler = async (req: any, ctx: any) =>
    handler(undefined, req, ctx);

app.http("UpdateTask", {
    methods: ["PATCH"],
    authLevel: "anonymous",
    handler: withMiddleware(adaptedHandler),
});
