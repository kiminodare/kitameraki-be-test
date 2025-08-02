import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ApiResponse } from "../dtos/ApiResponse.dto";

declare global {
    type TypedResponse<T> = HttpResponseInit & { jsonBody: ApiResponse<T> };
    type TypedHandler<TInput = unknown, TOutput = unknown> = (
        input: TInput,
        req: HttpRequest,
        ctx: InvocationContext
    ) => Promise<TypedResponse<TOutput>>;

}
