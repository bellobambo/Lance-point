"use client";
import { useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

interface CreateJobProps {
  onJobCreated: () => void;
}

export default function CreateJob({ onJobCreated }: CreateJobProps) {
  const { program, publicKey } = useAnchorProgram();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(""); // input in SOL
  const [loading, setLoading] = useState(false);

  const handleCreateJob = async () => {
    if (!program || !publicKey) return;

    try {
      if (!title || !description || !amount) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      // convert SOL -> lamports (1 SOL = 1e9 lamports)
      const lamports = BigInt(Math.floor(Number(amount) * 1_000_000_000));

      const [jobPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("job_post"), publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), jobPda.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeJobPost(
          title,
          description,
          new BN(lamports.toString()) // ✅ safe BN for u64
        )
        .accounts({
          jobPost: jobPda,
          escrow: escrowPda,
          client: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("Job created!");
      setTitle("");
      setDescription("");
      setAmount("");

      // Notify parent that a job was created
      onJobCreated();
    } catch (error) {
      console.error(error);
      alert("Error creating job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Create Job</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
        disabled={loading}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2"
        disabled={loading}
      />
      <input
        placeholder="Amount (SOL)"
        type="number"
        step="0.000000001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-2"
        disabled={loading}
      />
      <button
        onClick={handleCreateJob}
        disabled={loading}
        className={`px-4 py-2 rounded flex items-center justify-center ${
          loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-amber-400 text-black hover:bg-amber-500"
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
            Creating...
          </>
        ) : (
          "Create Job"
        )}
      </button>
    </div>
  );
}
