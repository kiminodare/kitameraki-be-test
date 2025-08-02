import { cosmosClient } from "./cosmosClient";
import { FormSettings } from "../types/formSettings.types";
import { TaskDto } from "../dtos/ResponseTask.dto";
import { buildCustomFieldsSchema } from "./buildCustomFieldsSchema";
import { ZodObject } from "zod";

let cachedSchema: ZodObject<any> | null = null;
let cachedNormalize: ((data: any[]) => any[]) | null = null;

export async function getCombinedTaskSchema(): Promise<{
    schema: ZodObject<any>;
    normalize: (data: any[]) => any[];
}> {
    if (cachedSchema && cachedNormalize) {
        return { schema: cachedSchema, normalize: cachedNormalize };
    }

    const settingsContainer = cosmosClient.database("TaskApp").container("FormSettings");

    let customFields: FormSettings["fields"] = [];
    try {
        const { resource: formSettings } = await settingsContainer
            .item("form-settings", "form-settings")
            .read<FormSettings>();
        customFields = formSettings?.fields ?? [];
    } catch (err) {
        console.warn("Failed to read form settings, using static schema only", err);
    }

    const { schema: dynamicSchema, normalize } = buildCustomFieldsSchema(customFields);

    cachedSchema = TaskDto.extend(dynamicSchema.shape);
    cachedNormalize = normalize;

    return { schema: cachedSchema, normalize: cachedNormalize };
}
