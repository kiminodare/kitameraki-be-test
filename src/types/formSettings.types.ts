export type FieldType = "text" | "date" | "datetime" | "email" | "array";

export interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required?: boolean;
}

export interface FormSettings {
    id: 'form-settings';
    fields: FormField[];
}
