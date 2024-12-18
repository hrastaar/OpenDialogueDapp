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
    queryFn: () => program.account.OpenDialogueDapp.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // const initialize = useMutation({
  //   mutationKey: ["OpenDialogueDapp", "initialize", { cluster }],
  //   mutationFn: (keypair: Keypair) =>
  //     program.methods
  //       .initialize()
  //       .accounts({ OpenDialogueDapp: keypair.publicKey })
  //       .signers([keypair])
  //       .rpc(),
  //   onSuccess: (signature) => {
  //     transactionToast(signature);
  //     return accounts.refetch();
  //   },
  //   onError: () => toast.error("Failed to initialize account"),
  // });

  // TODO: Should create_channel be a standalone function here, or defined below in useOpenDialogueDappProgramAccount?
  const create_channel = useMutation({
    mutationKey: ["OpenDialogueDapp", "create_channel", { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .create_channel()
        .accounts({ OpenDialogueDapp: keypair.publicKey, subject: "" }) // TODO: how do we get the subject pubkey?
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create channel"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize: create_channel,
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
    queryFn: () => program.account.OpenDialogueDapp.fetch(account),
  });

  // Creates a new channel by invoking the program <create_channel> instruction
  const createChannelMutation = useMutation({
    mutationKey: ["OpenDialogueDapp", "create_channel", { cluster, account }],
    mutationFn: () =>
      program.methods
        .create_channel()
        .accounts({ OpenDialogueDapp: account })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  // Creates a new post for a channel by invoking the program <create_post> instruction
  const createPostMutation = useMutation({
    mutationKey: ["OpenDialogueDapp", "create_post", { cluster, account }],
    mutationFn: (content: string) =>
      program.methods
        .create_post(content)
        .accounts({ OpenDialogueDapp: account })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    createChannelMutation,
    createPostMutation,
  };
}
