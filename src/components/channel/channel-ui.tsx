"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useChannelProgram,
  useChannelProgramAccount,
} from "./channel-data-access";

export function ChannelCreate() {
  const { initialize } = useChannelProgram();

  const [subjectInput, setSubjectInput] = useState(""); // Text input state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleInitialize = async () => {
    try {
      // Convert input to PublicKey
      const subject = new PublicKey(subjectInput);

      // Example keypair for demo; replace with your actual keypair
      const keypair = Keypair.generate();

      // Call the mutation
      // TODO: because keypair is being generated, it has 0 SOL for gas
      // we need to update this to be the connected wallet, but idk how
      initialize.mutate({ keypair, subject });
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Invalid public key. Please enter a valid Solana public key.");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter a channel subject (Public Key)"
        value={subjectInput}
        onChange={(e) => setSubjectInput(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleInitialize}
        disabled={initialize.isPending}
      >
        Create a channel {initialize.isPending && "..."}
      </button>
    </div>
  );
}

export function ChannelList() {
  const { accounts, getProgramAccount } = useChannelProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <ChannelCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No channels</h2>
          No channels found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function ChannelCard({ account }: { account: PublicKey }) {
  const { accountQuery, createPostMutation, closeMutation } =
    useChannelProgramAccount({
      account,
    });

  const author = useMemo(
    () => accountQuery.data?.author ?? "",
    [accountQuery.data?.author]
  );
  const subject = useMemo(
    () => accountQuery.data?.subject ?? "",
    [accountQuery.data?.subject]
  );
  const posts = useMemo(
    () => accountQuery.data?.posts ?? [],
    [accountQuery.data?.posts]
  );
  const postCount = useMemo(
    () => accountQuery.data?.postCount ?? 0,
    [accountQuery.data?.postCount]
  );

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {subject.toString()}
          </h2>
          <p>by {author.toString()}</p>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => {
                const content = window.prompt("Set post content to:");
                if (!content || content === "") {
                  return;
                }
                return createPostMutation.mutateAsync(content);
              }}
              disabled={createPostMutation.isPending}
            >
              Post
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                return closeMutation.mutateAsync();
              }}
              disabled={closeMutation.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
