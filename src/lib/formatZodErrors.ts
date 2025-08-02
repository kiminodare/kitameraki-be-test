import { ZodError } from "zod";

export function formatZodErrors(error: ZodError<any>) {
    const formatted = error.format();
    const result: Record<string, string[]> = {};

    for (const key in formatted) {
        if (key !== "_errors") {
            const fieldErrors = formatted[key]?._errors;
            if (fieldErrors?.length) {
                result[key] = fieldErrors;
            }
        }
    }

    return result;
}
