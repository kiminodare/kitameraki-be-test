import {app} from "@azure/functions";
import {cosmosClient} from "../lib/cosmosClient";
import {ok} from "../lib/response";
import {withMiddleware} from "../lib/withMiddleware";
import {withValidation} from "../lib/withValidation";
import {generateDefaultFormFields} from "../lib/generateDefaultFieldsFromTask";
import {FormSettings} from "../dtos/ResponseGetFormSettings.dto";
import {GetFormSettingsInput, RequestGetFormSettingsDto} from "../dtos/RequestGetFormSettings.dto";

const handler: TypedHandler<GetFormSettingsInput, FormSettings> = async (_input, _req, ctx) => {
    const container = cosmosClient.database("TaskApp").container("FormSettings");

    try {
        const { resource } = await container
            .item("form-settings", "form-settings")
            .read<FormSettings>();

        if (!resource) {
            ctx.warn("Form settings item not found — using fallback");
            const defaults = generateDefaultFormFields();
            return ok({
                id: "form-settings",
                fields: defaults,
            });
        }

        const fields = (resource.fields ?? []).sort((a, b) => a.orderNumber - b.orderNumber);
        ctx.info("Form settings found", fields);
        return ok({
            id: "form-settings",
            fields,
        });
    } catch (err) {
        ctx.warn("Error accessing form settings — using fallback", err);
        const defaults = generateDefaultFormFields();
        return ok({
            id: "form-settings",
            fields: defaults,
        });
    }
};

app.http("GetFormSettings", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: withMiddleware(withValidation(RequestGetFormSettingsDto, handler)),
});
