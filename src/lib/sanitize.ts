import { ZodType } from "zod";

/**
 * Sanitize any data using a Zod schema
 * Automatically strips unknown fields and enforces type
 */
export function sanitize<T>(schema: ZodType<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Sanitize an array of objects using a Zod array schema
 */
export function sanitizeArray<T>(schema: ZodType<T>, data: unknown[]): T[] {
    return data.map(item => schema.parse(item));
}
