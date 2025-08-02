import { HttpResponseInit } from "@azure/functions";
import { ApiResponse } from "../dtos/ApiResponse.dto";

export function ok<T>(
    result: T,
    message = "Success"
): HttpResponseInit & { jsonBody: ApiResponse<T> } {
    return {
        status: 200,
        jsonBody: {
            status: true,
            message,
            result
        }
    };
}

export function fail(
    message = "Something went wrong",
    status = 400,
    issues?: Record<string, string[]>
): HttpResponseInit & { jsonBody: ApiResponse<never> } {
    return {
        status,
        jsonBody: {
            status: false,
            message,
            ...(issues ? { issues } : {}),
            result: null
        }
    };
}
