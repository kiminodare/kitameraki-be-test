import { z } from "zod";

export const FormFieldSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["text", "date", "datetime", "email", "array", "select"]),
    required: z.boolean(),
    useOptions: z.boolean(),
    options: z.array(z.string()).optional(),
    orderNumber: z.number(),
    position: z.enum(["left", "center", "right"]),
});

export const ResponseGetFormSettingsDto = z.object({}); // GET biasanya ga ada body

export const FormSettingsSchema = z.object({
    id: z.literal("form-settings"),
    fields: z.array(FormFieldSchema),
});

export type FormSettings = z.infer<typeof FormSettingsSchema>;
