export type ApiResponse<T> = {
    status: boolean;
    message: string;
    result: T | null;
    issues?: Record<string, string[]>;
};