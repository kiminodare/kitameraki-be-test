import {z} from "zod";

export const RequestInsertTaskDto = z.object({
    id: z.uuid().min(1, "id is required").optional(),
    organizationId: z.uuid().min(1, "organizationId is required"),
    title: z.string().min(1, "title is required").max(100, "title must be less than 100 characters"),
    description: z.string().min(1, "description is required").max(1000, "description must be less than 1000 characters"),
    dueDate: z.string().min(1, "dueDate is required"),
    priority: z.enum(["low", "medium", "high"], "priority is required"),
    status: z.enum(["todo", "in-progress", "completed"], "status is required"),
    tags: z.array(z.string(), "tags is required")
})