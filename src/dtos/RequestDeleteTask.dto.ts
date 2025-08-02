import { z } from "zod";

export const RequestDeleteTaskDto = z.object({
    id: z.string().min(1, "taskId is required"),
    organizationId: z.string().min(1, "organizationId is required"),
});

export type DeleteTaskDto = z.infer<typeof RequestDeleteTaskDto>;