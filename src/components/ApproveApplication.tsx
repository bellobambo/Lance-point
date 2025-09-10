"use client";
import { useState, useEffect } from "react";
import { useAnchorProgram } from "../lib/anchor";
import { PublicKey } from "@solana/web3.js";

export default function ApproveApplication() {
  const { program, publicKey } = useAnchorProgram();
  const [applications, setApplications] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [approvingApps, setApprovingApps] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (!program) return;

    const fetchApps = async () => {
      setLoading(true);
      try {
        const apps = await program.account.application.all();
        setApplications(apps);
      } catch (error) {
        console.error("Error fetching applications:", error);
        alert("Error fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [program]);

  const handleApprove = async (application: any) => {
    if (!program || !publicKey) return;

    const appKey = application.publicKey.toString();

    try {
      setApprovingApps((prev) => ({ ...prev, [appKey]: true }));

      const jobPost = application.account.jobPost;

      await program.methods
        .approveApplication()
        .accounts({
          application: application.publicKey,
          jobPost: jobPost,
          client: publicKey,
        })
        .rpc();

      alert("Application approved!");

      // Refresh the applications list to update the UI
      const updatedApps = await program.account.application.all();
      setApplications(updatedApps);
    } catch (err) {
      console.error(err);
      alert("Error approving");
    } finally {
      setApprovingApps((prev) => ({ ...prev, [appKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded">
        <h2 className="font-bold mb-2">Applications</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <span className="ml-3">Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Applications</h2>

      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No applications found
        </div>
      ) : (
        applications.map((app: any) => {
          const appKey = app.publicKey.toString();
          const isApproving = approvingApps[appKey] || false;

          return (
            <div key={appKey} className="border p-4 mb-4 rounded">
              <p className="mb-1">
                <span className="font-semibold">Applicant:</span>{" "}
                {app.account.applicant.toString()}
              </p>
              <p className="mb-3">
                <span className="font-semibold">Resume:</span>{" "}
                <a
                  href={app.account.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {app.account.resumeLink}
                </a>
              </p>

              {!app.account.approved ? (
                <button
                  onClick={() => handleApprove(app)}
                  disabled={isApproving}
                  className={`px-4 py-2 rounded flex items-center justify-center ${
                    isApproving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-amber-400 text-black hover:bg-amber-500"
                  }`}
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    "Approve"
                  )}
                </button>
              ) : (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                  Approved ✅
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
