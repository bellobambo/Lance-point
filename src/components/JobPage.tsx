"use client";
import { useState } from "react";
import JobList from "./JobList";
import CreateJob from "./CreateJob";

export default function JobsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleJobCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <CreateJob onJobCreated={handleJobCreated} />
      <JobList refreshTrigger={refreshTrigger} />
    </div>
  );
}
