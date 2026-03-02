import type { Metadata } from "next";
import dynamic from "next/dynamic";

const TemplateUploadForm = dynamic(
  () =>
    import("@/modules/templates/components/TemplateUploadForm").then(
      (m) => m.TemplateUploadForm,
    ),
  { loading: () => <FormSkeleton /> },
);

export const metadata: Metadata = {
  title: "Submit Template",
  robots: { index: false, follow: false },
};

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6 max-w-4xl mx-auto">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-neutral-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function UploadTemplatePage() {
  return <TemplateUploadForm />;
}
