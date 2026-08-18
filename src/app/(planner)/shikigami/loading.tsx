import { TableSkeleton } from "@/components/TableSkeleton";

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <TableSkeleton />
    </div>
  );
}
