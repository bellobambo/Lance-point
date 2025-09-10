"use client";
import ApproveApplication from "@/components/ApproveApplication";
import JobsPage from "@/components/JobPage";

export default function Home() {
  return (
    <div className="p-4 max-w-4xl mx-auto bg-[black] text-amber-400">
      <h1 className="text-2xl font-bold mb-4">Lancepoint DApp</h1>
      <JobsPage />
      <ApproveApplication />
    </div>
  );
}
