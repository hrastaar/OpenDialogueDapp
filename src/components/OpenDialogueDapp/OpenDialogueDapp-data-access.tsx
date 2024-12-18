"use client";

import {
  getOpenDialogueDappProgram,
  getOpenDialogueDappProgramId,
} from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

export function useOpenDialogueDappProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getOpenDialogueDappProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getOpenDialogueDappProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["OpenDialogueDapp", "all", { cluster }],
    queryFn: () => program.account.state.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ["OpenDialogueDapp", "initialize", { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ payer: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to initialize account"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useOpenDialogueDappProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useOpenDialogueDappProgram();

  const accountQuery = useQuery({
    queryKey: ["OpenDialogueDapp", "fetch", { cluster, account }],
    queryFn: () => program.account.state.fetch(account),
  });

  const createChannelMutation = useMutation({
    mutationKey: ["OpenDialogueDapp", "create_channel", { cluster, account }],
    mutationFn: () =>
      program.methods
        .createChannel()
        .accounts({ state: account, author: "", subject: "" })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const closeChannelMutation = useMutation({
    mutationKey: ["OpenDialogueDapp", "close_channel", { cluster, account }],
    mutationFn: () =>
      program.methods.closeChannel().accounts({ payer: "", channel: "" }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const createPostMutation = useMutation({
    mutationKey: ["OpenDialogueDapp", "create_post", { cluster, account }],
    mutationFn: (content: string) =>
      program.methods.createPost(content).accounts({ author: "" }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    createChannelMutation,
    closeChannelMutation,
    createPostMutation,
  };
}
