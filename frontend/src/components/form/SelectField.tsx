import { Variable } from "@/types/template";

interface Props {
  variable: Variable;
  value: string;
  onChange: (value: string) => void;
  touched: boolean;
}

export default function SelectField({ variable, value, onChange, touched }: Props) {
  const isError = touched && variable.required && !value.trim();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {variable.label}
        {variable.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {variable.description && (
        <p className="text-xs text-gray-500">{variable.description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
        }`}
      >
        <option value="">Select an option…</option>
        {variable.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {isError && <p className="text-xs text-red-500">This field is required</p>}
    </div>
  );
}
