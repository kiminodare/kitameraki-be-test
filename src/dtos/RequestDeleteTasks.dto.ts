import {z} from "zod";

export const RequestDeleteTasksDto = z.object({
    organizationId: z.string().min(1, "organizationId is required"),
    ids: z
        .array(z.string().min(1, "Task ID required"))
        .min(1, "At least one task ID is required")
});

export type DeleteTasksDto = z.infer<typeof RequestDeleteTasksDto>;