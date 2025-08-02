import { app } from "@azure/functions";
import { withMiddleware } from "../lib/withMiddleware";
import { withValidation } from "../lib/withValidation";
import { fail, ok } from "../lib/response";
import { cosmosClient } from "../lib/cosmosClient";
import { RequestPostFormSettingsDto, PostFormSettingsInput } from "../dtos/RequestPostFormSettings.dto";
import { setupCosmos } from "../lib/setupCosmos";

const handler: TypedHandler<PostFormSettingsInput, null> = async (input, _req, ctx) => {
    await setupCosmos();
    const container = cosmosClient.database("TaskApp").container("FormSettings");

    const incomingFields = input.fields;

    if (incomingFields.length === 0) {
        return fail("No fields provided. Nothing to save.", 400);
    }

    try {
        // Ambil dokumen existing (kalau ada)
        const { resource: existingDoc } = await container.item("form-settings", "form-settings").read<any>();
        const existingFields: PostFormSettingsInput["fields"] = existingDoc?.fields ?? [];

        // Gabungkan: update existing jika id match, kalau tidak tambahkan
        const mergedFields = [...existingFields];
        for (const newField of incomingFields) {
            const idx = mergedFields.findIndex((f) => f.id === newField.id);
            if (idx !== -1) {
                mergedFields[idx] = newField; // update
            } else {
                mergedFields.push(newField); // insert
            }
        }

        const updatedDocument = {
            id: "form-settings",
            fields: mergedFields,
        };

        await container.items.upsert(updatedDocument);

        return ok(null, "Form settings saved successfully");
    } catch (err: any) {
        ctx.error("Failed to save form settings", err);
        return fail("Unable to save form settings", 500);
    }
};

app.http("PostFormSettings", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestPostFormSettingsDto, handler)),
});
