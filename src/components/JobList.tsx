"use client";
import { useEffect, useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

interface JobListProps {
  refreshTrigger: number;
}

export default function JobList({ refreshTrigger }: JobListProps) {
  const { program, publicKey } = useAnchorProgram();
  const [jobs, setJobs] = useState([]);
  const [resumeLinks, setResumeLinks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [applyingJobs, setApplyingJobs] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!program) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobAccounts: any = await program.account.jobPost.all();
        setJobs(jobAccounts);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        alert("Error fetching jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [program, refreshTrigger]);

  const handleApply = async (job: any) => {
    if (!program || !publicKey) return;

    const jobKey = job.publicKey.toString();
    const resumeLink = resumeLinks[jobKey] || "";

    if (!resumeLink.trim()) {
      alert("Please enter a resume link before applying");
      return;
    }

    // Set loading state for this specific job
    setApplyingJobs((prev) => ({ ...prev, [jobKey]: true }));

    try {
      const [applicationPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("application"),
          job.publicKey.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .applyToJob(resumeLink)
        .accounts({
          application: applicationPda,
          applicant: publicKey,
          jobPost: job.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("Applied successfully!");
      // Clear the resume link for this job after successful application
      setResumeLinks((prev) => ({ ...prev, [jobKey]: "" }));
    } catch (error) {
      console.error(error);
      alert("Error applying");
    } finally {
      // Clear loading state for this specific job
      setApplyingJobs((prev) => ({ ...prev, [jobKey]: false }));
    }
  };

  const handleResumeLinkChange = (jobKey: string, value: string) => {
    setResumeLinks((prev) => ({ ...prev, [jobKey]: value }));
  };

  // Function to convert lamports to SOL
  const lamportsToSol = (lamports: number | string | bigint) => {
    const lamportsNum =
      typeof lamports === "bigint"
        ? Number(lamports)
        : typeof lamports === "string"
        ? parseInt(lamports)
        : lamports;
    return lamportsNum / 1_000_000_000; // 1 SOL = 1,000,000,000 lamports
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Available Jobs</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <span className="ml-3">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Jobs</h2>

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No jobs available at the moment
        </div>
      ) : (
        jobs.map((job: any) => {
          const jobKey = job.publicKey.toString();
          const resumeLink = resumeLinks[jobKey] || "";
          const isApplying = applyingJobs[jobKey] || false;

          return (
            <div key={jobKey} className="border p-4 mb-4 rounded">
              <h3 className="font-bold text-lg mb-2">{job.account.title}</h3>
              <p className="mb-2">{job.account.description}</p>
              <p className="mb-3 font-semibold">
                Amount: {lamportsToSol(job.account.amount.toString())} SOL
              </p>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Enter your resume link (required)"
                  value={resumeLink}
                  onChange={(e) =>
                    handleResumeLinkChange(jobKey, e.target.value)
                  }
                  className="border p-2 w-full rounded"
                  disabled={isApplying}
                />
              </div>

              <button
                onClick={() => handleApply(job)}
                disabled={!resumeLink.trim() || isApplying}
                className={`px-4 py-2 rounded flex items-center justify-center ${
                  resumeLink.trim() && !isApplying
                    ? "bg-amber-400 text-black hover:bg-amber-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
