import { z } from "zod";

export const RequestGetTaskDto = z.object({
    id: z.string().min(1, "taskId is required"),
    organizationId: z.string().min(1, "organizationId is required"),
});

export type GetTaskInput = z.infer<typeof RequestGetTaskDto>;
