export type VariableType = "text" | "date" | "number" | "currency" | "select";

export interface Variable {
  key: string;
  label: string;
  type: VariableType;
  required: boolean;
  options?: string[];
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  jurisdiction?: string;
  variables: Variable[];
  content: string;
}

export interface TemplateIndexEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  file: string;
}
