import { ZodError } from "zod";

export function formatZodErrors(error: ZodError<any>) {
    const result: Record<string, string[]> = {};

    for (const issue of error.issues) {
        const key = issue.path.join(".");
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(issue.message);
    }

    return result;
}
