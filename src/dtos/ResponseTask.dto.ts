import { z } from "zod";

export const TaskDto = z.object({
    id: z.uuid(),
    organizationId: z.uuid(),
    title: z.string().max(100),
    description: z.string().max(1000),
    dueDate: z.string().refine(
        val => !isNaN(Date.parse(val)),
        {message: "Invalid date format"}
    ),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in-progress", "completed"]),
    tags: z.array(z.string().max(50))
});