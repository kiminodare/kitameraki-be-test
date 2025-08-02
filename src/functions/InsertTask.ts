// functions/InsertTask.ts
import { app } from "@azure/functions";
import { ok } from "../lib/response";
import { withMiddleware } from "../lib/withMiddleware";
import { cosmosClient } from "../lib/cosmosClient";
import { RequestInsertTaskDto } from "../dtos/RequestInsertTask";
import { generateZodFromFields } from "../lib/generateZodFromFormSettings";
import { FormSettings } from "../types/formSettings.types";
import { mergeSchemas } from "../lib/mergeSchemas";
import { v4 as uuidv4 } from "uuid";
import {formatZodErrors} from "../lib/formatZodErrors";

const handler: TypedHandler<unknown, null> = async (_, req, ctx) => {
    const body = await req.json();

    // STEP 1: Default schema
    let schema = RequestInsertTaskDto;

    // STEP 2: Attempt to load dynamic schema
    try {
        const { resource: settings } = await cosmosClient
            .database("TaskApp")
            .container("FormSettings")
            .item("form-settings", "form-settings")
            .read<FormSettings>();

        if (settings?.fields?.length) {
            const dynamic = generateZodFromFields(settings.fields);
            schema = mergeSchemas(RequestInsertTaskDto, dynamic.shape);
        }
    } catch (err) {
        ctx.warn("Dynamic schema load failed or not found — fallback to DTO");
    }

    // STEP 3: Validate
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        const issues = formatZodErrors(parsed.error);
        ctx.warn("Validation failed", issues);

        return {
            status: 400,
            jsonBody: {
                status: false,
                message: "Validation failed",
                issue: issues,
                result: null
            }
        };
    }

    const input = parsed.data;
    const container = cosmosClient.database("TaskApp").container("Tasks");

    // STEP 4: Ensure unique ID
    let id = input.id ?? uuidv4();
    let retryCount = 0;
    while (retryCount < 3) {
        const { resource: existing } = await container.item(id, input.organizationId).read();
        if (!existing) break;
        id = uuidv4();
        retryCount++;
    }

    // STEP 5: Save to DB
    const task = {
        ...input,
        id,
        createdAt: new Date().toISOString(),
    };

    await container.items.create(task);
    return ok(null, "Task created successfully");
};

const adaptedHandler = async (req: any, ctx: any) => handler(undefined, req, ctx);

app.http("InsertTask", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: withMiddleware(adaptedHandler),
});
