import { z } from "zod";

export const RequestGetTasksDto = z.object({
    organizationId: z.string().min(1, "organizationId is required"),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(["todo", "in-progress", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
});

export type GetTasksInput = z.infer<typeof RequestGetTasksDto>;
