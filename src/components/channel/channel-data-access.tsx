"use client";

import { getChannelProgram, getChannelProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

export function useChannelProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getChannelProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getChannelProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["channel", "all", { cluster }],
    queryFn: () => program.account.channel.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ["channel", "initialize", { cluster }],
    mutationFn: async ({
      keypair,
      subject,
    }: {
      keypair: Keypair;
      subject: PublicKey;
    }) => {
      // Compute the PDA for the channel account
      const [channelPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("channel"), subject.toBuffer()],
        program.programId // Replace with your program ID
      );

      return program.methods
        .initialize()
        .accounts({
          author: keypair.publicKey, // Connected wallet
          subject: subject, // Subject account
          // channel: channelPDA, // Computed PDA
          // systemProgram: SystemProgram.programId, // System program for initialization
        })
        .signers([keypair])
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to initialize account");
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useChannelProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useChannelProgram();

  const accountQuery = useQuery({
    queryKey: ["channel", "fetch", { cluster, account }],
    queryFn: () => program.account.channel.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ["channel", "close", { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ channel: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  // const createPostMutation = useMutation({
  //   mutationKey: ["channel", "set", { cluster, account }],
  //   mutationFn: (value: number) =>
  //     program.methods.create(value).accounts({ channel: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accountQuery.refetch();
  //   },
  // });

  // ----

  // const decrementMutation = useMutation({
  //   mutationKey: ["channel", "decrement", { cluster, account }],
  //   mutationFn: () =>
  //     program.methods.decrement().accounts({ channel: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accountQuery.refetch();
  //   },
  // });

  // const incrementMutation = useMutation({
  //   mutationKey: ["channel", "increment", { cluster, account }],
  //   mutationFn: () =>
  //     program.methods.increment().accounts({ channel: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accountQuery.refetch();
  //   },
  // });

  // const setMutation = useMutation({
  //   mutationKey: ["channel", "set", { cluster, account }],
  //   mutationFn: (value: number) =>
  //     program.methods.set(value).accounts({ channel: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accountQuery.refetch();
  //   },
  // });

  return {
    accountQuery,
    closeMutation,
  };
}
