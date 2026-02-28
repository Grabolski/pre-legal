import { Variable } from "@/types/template";
import TextField from "./TextField";
import DateField from "./DateField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";

interface Props {
  variables: Variable[];
  values: Record<string, string>;
  touched: Record<string, boolean>;
  onChange: (key: string, value: string) => void;
  onBlur: (key: string) => void;
}

interface FieldGroup {
  title: string;
  variables: Variable[];
}

function groupVariables(variables: Variable[]): FieldGroup[] {
  const partyA: Variable[] = [];
  const partyB: Variable[] = [];
  const terms: Variable[] = [];

  for (const v of variables) {
    if (v.key.startsWith("party_a_")) partyA.push(v);
    else if (v.key.startsWith("party_b_")) partyB.push(v);
    else terms.push(v);
  }

  const groups: FieldGroup[] = [];
  if (partyA.length > 0) groups.push({ title: "Party A", variables: partyA });
  if (partyB.length > 0) groups.push({ title: "Party B", variables: partyB });
  if (terms.length > 0) groups.push({ title: "Agreement Terms", variables: terms });
  return groups;
}

function renderField(
  variable: Variable,
  value: string,
  touched: boolean,
  onChange: (value: string) => void
) {
  const props = { variable, value, onChange, touched };
  switch (variable.type) {
    case "date":
      return <DateField key={variable.key} {...props} />;
    case "number":
    case "currency":
      return <NumberField key={variable.key} {...props} />;
    case "select":
      return <SelectField key={variable.key} {...props} />;
    default:
      return <TextField key={variable.key} {...props} />;
  }
}

export default function TemplateForm({ variables, values, touched, onChange, onBlur }: Props) {
  const groups = groupVariables(variables);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <fieldset key={group.title} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {group.title}
          </legend>
          {group.variables.map((variable) =>
            <div key={variable.key} onBlur={() => onBlur(variable.key)}>
              {renderField(
                variable,
                values[variable.key] ?? "",
                touched[variable.key] ?? false,
                (val) => onChange(variable.key, val)
              )}
            </div>
          )}
        </fieldset>
      ))}
    </div>
  );
}
