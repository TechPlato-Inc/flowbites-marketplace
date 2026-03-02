import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BlogManagementView = dynamic(
  () =>
    import("@/modules/dashboard/admin/BlogManagementView").then(
      (m) => m.BlogManagementView,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const metadata: Metadata = {
  title: "Blog Management",
  robots: { index: false, follow: false },
};

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="h-64 bg-neutral-200 rounded-lg" />
    </div>
  );
}

export default function BlogManagementPage() {
  return <BlogManagementView />;
}
