import { z, ZodType } from "zod";
import { FormSettings } from "../types/formSettings.types";

export function buildCustomFieldsSchema(fields: FormSettings["fields"]) {
    const shape: { [key: string]: ZodType } = {};
    const fieldIds = fields.map((f) => f.id);

    for (const field of fields) {
        let fieldSchema: ZodType;

        switch (field.type) {
            case "email":
                fieldSchema = z.email();
                break;
            case "date":
            case "datetime":
                fieldSchema = z
                    .string()
                    .refine((val) => !isNaN(Date.parse(val)), {
                        message: "Invalid date format"
                    });
                break;
            case "text":
                fieldSchema = z.string();
                break;
            default:
                fieldSchema = z.any();
        }

        // ⬅️ Allow null or missing values
        shape[field.id] = fieldSchema.optional().nullable();
    }

    const schema = z.object(shape);

    // Inject null for missing fields
    function normalize<T extends Record<string, any>>(data: T[]): T[] {
        return data.map((item) => {
            const patched: Record<string, any> = { ...item }; // ✅ type-safe write access

            for (const id of fieldIds) {
                if (!(id in patched)) {
                    patched[id] = null;
                }
            }

            return patched as T; // ✅ cast back to original type
        });
    }

    return { schema, normalize };
}
