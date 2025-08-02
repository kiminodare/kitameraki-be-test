// lib/withValidation.ts
import {ZodType} from "zod";
import {HttpRequest, HttpResponseInit, InvocationContext} from "@azure/functions";
import {isObject} from "./isObject";
import {ApiResponse} from "../dtos/ApiResponse.dto";
import {MiddlewareHandler} from "./withMiddleware";
import {formatZodErrors} from "./formatZodErrors";

// Handler function that expects validated input and returns typed ApiResponse
export type ValidatedHandler<TInput, TData> = (
    data: TInput,
    req: HttpRequest,
    ctx: InvocationContext
) => Promise<HttpResponseInit & { jsonBody: ApiResponse<TData> }>;

/**
 * Middleware wrapper that:
 * - Parses and validates query or body using Zod schema
 * - Injects parsed `input` into handler if valid
 * - Returns 400 on validation error with formatted issue
 */
export function withValidation<TInput, TData>(
    schema: ZodType<TInput>,
    handler: ValidatedHandler<TInput, TData>
): MiddlewareHandler<TData> {
    return async (req: HttpRequest, ctx: InvocationContext) => {
        try {
            // Extract query parameters
            const query = Object.fromEntries(req.query.entries());

            // Attempt to parse JSON body for non-GET requests
            let body: unknown = {};
            if (req.method !== "GET") {
                body = await req.json().catch(() => ({})); // tolerate malformed or empty JSON
            }

            // Merge query/body depending on method type
            const input = {
                ...(req.method === "GET" ? query : {}),
                ...(isObject(body) ? body : {})
            };

            // Zod validation
            const parsed = schema.safeParse(input);

            if (!parsed.success) {
                ctx.warn("Validation failed", parsed.error.issues);

                return {
                    status: 400,
                    jsonBody: {
                        status: false,
                        message: "Validation failed",
                        issue: formatZodErrors(parsed.error),
                        result: null
                    }
                };
            }

            // All good, pass validated data to handler
            return await handler(parsed.data, req, ctx);
        } catch (err: any) {
            ctx.error("Validation or handler failed", err);

            return {
                status: 500,
                jsonBody: {
                    status: false,
                    message: "Internal Server Error",
                    issue: err?.message,
                    result: null
                }
            };
        }
    };
}
