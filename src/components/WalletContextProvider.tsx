"use client";

import React, { ReactNode, useMemo, useEffect, useState } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL); // convert lamports → SOL
      }
    };

    fetchBalance();

    // auto refresh every 10s
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, publicKey]);

  if (!publicKey) return null;

  return (
    <p className="text-amber-400 font-semibold">
      Balance: {balance !== null ? balance.toFixed(4) : "…"} SOL
    </p>
  );
};

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-black text-amber-400">
            <header className="bg-black text-amber-400 shadow-sm p-4 border-b border-amber-300">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-amber-400">
                  Lancepoint
                </h1>
                <div className="flex items-center gap-4">
                  <WalletBalance />
                  <WalletMultiButton />
                </div>
              </div>
            </header>
            <main className="p-5">{children}</main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
