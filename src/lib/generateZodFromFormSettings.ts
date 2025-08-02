import {z} from "zod";
import {FormField} from "../types/formSettings.types";

export function generateZodFromFields(fields: FormField[]) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        let base: z.ZodTypeAny;

        switch (field.type) {
            case "text":
                base = z.string();
                break;
            case "email":
                base = z.email();
                break;
            case "date":
            case "datetime":
                base = z.string().refine(
                    val => !isNaN(Date.parse(val)),
                    {message: "Invalid date"}
                );
                break;
            default:
                base = z.any();
        }

        // Use `.min(1)` only if it's a string type
        if (field.required) {
            if (base instanceof z.ZodString) {
                shape[field.id] = base.min(1, `${field.label} is required`);
            } else {
                shape[field.id] = base;
            }
        } else {
            shape[field.id] = base.optional();
        }
    }

    return z.object(shape);
}
