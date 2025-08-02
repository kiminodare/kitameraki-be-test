import { z } from "zod";

export const FieldTypeEnum = z.enum(["text", "date", "datetime", "email", "array", "select"]);

export const FormFieldDto = z.object({
    id: z.string().min(1, "Field ID is required"),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    type: FieldTypeEnum,
    required: z.boolean().optional(),
    useOptions: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    orderNumber: z.number().optional(),
    position: z.enum(["left", "right", "center"]).optional(),
    parentId: z.string().optional(),
});

export const RequestPostFormSettingsDto = z.object({
    fields: z.array(FormFieldDto).min(1, "At least one field is required")
});

export type PostFormSettingsInput = z.infer<typeof RequestPostFormSettingsDto>;
