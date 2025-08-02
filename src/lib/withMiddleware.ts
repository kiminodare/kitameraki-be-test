// lib/withMiddleware.ts
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ApiResponse } from "../dtos/ApiResponse.dto";

export type MiddlewareHandler<T = unknown> = (
    req: HttpRequest,
    ctx: InvocationContext
) => Promise<HttpResponseInit & { jsonBody: ApiResponse<T> }>;

export function withMiddleware<T>(handler: MiddlewareHandler<T>): MiddlewareHandler<T> {
    return async (req: HttpRequest, ctx: InvocationContext) => {
        try {
            ctx.log(`Incoming ${req.method} ${req.url}`);

            const response = await handler(req, ctx);

            return {
                ...response,
                headers: {
                    "Content-Type": "application/json",
                    ...(response.headers || {})
                }
            };
        } catch (err: any) {
            ctx.error("Unhandled error", err);

            return {
                status: 500,
                jsonBody: {
                    status: false,
                    message: err?.message || "Internal Server Error",
                    issues: err?.issues,
                    result: null
                }
            };
        }
    };
}
