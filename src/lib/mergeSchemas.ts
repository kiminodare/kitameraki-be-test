import { z, ZodObject, ZodRawShape } from "zod";

export function mergeSchemas<
    TBase extends ZodObject<any>,
    TExtra extends ZodRawShape
>(
    base: TBase,
    extra: TExtra
): ZodObject<TBase["shape"] & TExtra> {
    return z.object({
        ...base.shape,
        ...extra
    });
}
