import { replaceVariables } from "@/lib/interpolate";

interface Props {
  content: string;
  formValues: Record<string, string>;
}

export default function GenericPreview({ content, formValues }: Props) {
  const filled = replaceVariables(content, formValues);
  return (
    <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed">
      {filled}
    </pre>
  );
}
