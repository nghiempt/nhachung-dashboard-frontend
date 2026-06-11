import { LoadingState } from "@/components/ui/Skeleton";

// Shown instantly on navigation while the route segment's JS streams in.
// In-page skeletons handle the subsequent client-side data fetch.
export default function DashboardSegmentLoading() {
  return (
    <div style={{ padding: 24 }}>
      <LoadingState minHeight="70vh" />
    </div>
  );
}
