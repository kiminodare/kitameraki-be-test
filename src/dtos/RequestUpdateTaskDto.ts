import { z } from "zod";

export const RequestUpdateTaskDto = z.object({
    id: z.uuid({ message: "Task ID is required and must be UUID" }),
    organizationId: z.uuid({ message: "organizationId is required and must be UUID" }),
    // body is optional because patch might send partial fields
    title: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.string().optional(),
    status: z.enum(["todo", "in-progress", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tags: z.array(z.string().max(50)).optional()
});
