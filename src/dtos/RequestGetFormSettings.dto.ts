import {z} from "zod";

export const RequestGetFormSettingsDto = z.object({
    organizationId: z.uuid()
});

export type GetFormSettingsInput = z.infer<typeof RequestGetFormSettingsDto>;
