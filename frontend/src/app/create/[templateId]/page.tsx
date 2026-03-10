import CreateDocumentPage from "./CreateDocumentPage";

interface Props {
  params: Promise<{ templateId: string }>;
}

export async function generateStaticParams() {
  return [
    { templateId: "mutual-non-disclosure-agreement" },
    { templateId: "non-disclosure-agreement" },
    { templateId: "employment-contract" },
    { templateId: "service-agreement" },
    { templateId: "residential-tenancy-agreement" },
    { templateId: "terms-of-service" },
  ];
}

export default async function Page({ params }: Props) {
  const { templateId } = await params;
  return <CreateDocumentPage templateId={templateId} />;
}
