import { Task } from "../types/task.types";
import { FieldType, FormField } from "../types/formSettings.types";

type TaskFieldKeys = keyof Task;

const metadata: Record<TaskFieldKeys, {
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
}> = {
    id: { label: "ID", type: "text", required: true },
    organizationId: { label: "Organization", type: "text", required: true },
    title: { label: "Title", type: "text", required: true },
    description: { label: "Description", type: "text", required: false },
    dueDate: { label: "Due Date", type: "date", required: false },
    priority: {
        label: "Priority",
        type: "text",
        required: false,
        options: ["low", "medium", "high"]
    },
    status: {
        label: "Status",
        type: "text",
        required: true,
        options: ["todo", "in-progress", "completed"]
    },
    tags: { label: "Tags", type: "array", required: false }
};


export const generateDefaultFormFields = (): FormField[] => {
    return Object.entries(metadata).map(([id, meta]) => ({
        id,
        label: meta.label,
        type: meta.type,
        required: meta.required,
        ...(meta.options ? { options: meta.options } : {}),
    }));
};
