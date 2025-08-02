import { app } from "@azure/functions";
import { withValidation } from "../lib/withValidation";
import { withMiddleware } from "../lib/withMiddleware";
import { sanitizeArray } from "../lib/sanitize";
import { ok } from "../lib/response";
import { cosmosClient } from "../lib/cosmosClient";
import { RequestGetTasksDto, GetTasksInput } from "../dtos/RequestGetTasks.dto";
import { TaskDto } from "../dtos/ResponseTask.dto";
import { getCombinedTaskSchema } from "../lib/getCombinedTaskSchema";
import { z } from "zod";

const buildFilterQuery = (input: GetTasksInput) => {
    let filter = "c.organizationId = @organizationId";
    const parameters: { name: string; value: any }[] = [
        { name: "@organizationId", value: input.organizationId },
    ];

    if (input.status) {
        filter += " AND LOWER(c.status) = LOWER(@status)";
        parameters.push({ name: "@status", value: input.status });
    }

    if (input.priority) {
        filter +=
            " AND IS_DEFINED(c.priority) AND LOWER(c.priority) = LOWER(@priority)";
        parameters.push({ name: "@priority", value: input.priority });
    }

    if (input.search) {
        filter += ` AND (
      (IS_DEFINED(c.title) AND CONTAINS(LOWER(c.title), LOWER(@search))) OR
      (IS_DEFINED(c.description) AND CONTAINS(LOWER(c.description), LOWER(@search))) OR
      (IS_DEFINED(c.tags) AND ARRAY_CONTAINS(c.tags, @search, true))
    )`;
        parameters.push({ name: "@search", value: input.search });
    }

    return { filter, parameters };
};

const buildStatusCountQuery = (organizationId: string) => ({
    query: `
    SELECT c.status, COUNT(1) AS count
    FROM c
    WHERE c.organizationId = @organizationId
      AND IS_DEFINED(c.status)
      AND c.status IN ("todo", "in-progress", "completed")
    GROUP BY c.status
  `,
    parameters: [{ name: "@organizationId", value: organizationId }],
});

const handler: TypedHandler<
    GetTasksInput,
    {
        tasks: z.infer<typeof TaskDto>[];
        pagination: { page: number; limit: number; total: number };
        statusCounts: Record<"todo" | "in-progress" | "completed", number>;
    }
> = async (input, _req) => {
    const { page, limit, organizationId } = input;
    const offset = (page - 1) * limit;

    const db = cosmosClient.database("TaskApp");
    const container = db.container("Tasks");

    const { filter, parameters } = buildFilterQuery(input);

    // Count total matching records
    const countQuery = {
        query: `SELECT VALUE COUNT(1) FROM c WHERE ${filter}`,
        parameters,
    };

    const { resources: [total] = [0] } = await container.items
        .query(countQuery, { partitionKey: organizationId })
        .fetchNext();

    if (!total) {
        return ok(
            {
                tasks: [],
                pagination: { page, limit, total: 0 },
                statusCounts: { todo: 0, "in-progress": 0, completed: 0 },
            },
            "No tasks found"
        );
    }

    // Fetch paginated task data
    const dataQuery = {
        query: `
      SELECT *
      FROM c
      WHERE ${filter}
      OFFSET @offset LIMIT @limit
    `,
        parameters: [
            ...parameters,
            { name: "@offset", value: offset },
            { name: "@limit", value: limit },
        ],
    };

    const { resources } = await container.items
        .query(dataQuery, { partitionKey: organizationId })
        .fetchNext();

    // Count by status
    const statusCountQuery = buildStatusCountQuery(organizationId);
    const { resources: statusCountsRaw } = await container.items
        .query(statusCountQuery, { partitionKey: organizationId })
        .fetchNext();

    const statusCounts = {
        todo: 0,
        "in-progress": 0,
        completed: 0,
    };

    for (const row of statusCountsRaw) {
        const status = row.status.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status as keyof typeof statusCounts] = row.count;
        }
    }

    const { schema: CombinedTaskSchema, normalize } = await getCombinedTaskSchema();
    const normalized = normalize(resources);
    const validatedTasks = sanitizeArray(CombinedTaskSchema, normalized);

    return ok(
        {
            tasks: validatedTasks,
            pagination: { page, limit, total },
            statusCounts,
        },
        "Tasks fetched successfully"
    );
};

app.http("GetTasks", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestGetTasksDto, handler)),
});
