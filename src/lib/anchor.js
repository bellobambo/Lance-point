"use client";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import IDL from "./idl.json";

// your program id (from deployment)
export const PROGRAM_ID = new PublicKey(
  "yrVE4qohX1JF9id9yB2ML6eUDdWm6oQ44DSVbRwHRAw"
);

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    return new AnchorProvider(
      connection,
      wallet, // wallet already has signTransaction/sendTransaction
      { preflightCommitment: "processed" }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  return { provider, program, publicKey: wallet.publicKey };
};
