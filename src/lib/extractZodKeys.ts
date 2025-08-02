import { ZodObject } from "zod";

export function extractZodKeys(schema: ZodObject<any>): string[] {
    return Object.keys(schema.shape);
}
