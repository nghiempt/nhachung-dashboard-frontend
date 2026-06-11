import { LoadingState } from "@/components/ui/Skeleton";

// Shown instantly on navigation while the admin route segment's JS streams in.
export default function AdminSegmentLoading() {
  return (
    <div style={{ padding: 24 }}>
      <LoadingState minHeight="70vh" />
    </div>
  );
}
