import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CreatorDashboardView = dynamic(
  () =>
    import("@/modules/dashboard/creator/CreatorDashboardView").then(
      (m) => m.CreatorDashboardView,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const metadata: Metadata = {
  title: "Creator Studio",
  robots: { index: false, follow: false },
};

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-neutral-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-neutral-200 rounded-lg" />
    </div>
  );
}

export default function CreatorDashboardPage() {
  return <CreatorDashboardView />;
}
