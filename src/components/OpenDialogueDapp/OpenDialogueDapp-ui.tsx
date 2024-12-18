"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useOpenDialogueDappProgram,
  useOpenDialogueDappProgramAccount,
} from "./OpenDialogueDapp-data-access";

export function OpenDialogueDappCreate() {
  const { initialize } = useOpenDialogueDappProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => initialize.mutateAsync(Keypair.generate())}
      disabled={initialize.isPending}
    >
      Create {initialize.isPending && "..."}
    </button>
  );
}

export function OpenDialogueDappList() {
  const { accounts, getProgramAccount } = useOpenDialogueDappProgram();

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
            <OpenDialogueDappCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function OpenDialogueDappCard({ account }: { account: PublicKey }) {
  const { accountQuery, createPostMutation } =
    useOpenDialogueDappProgramAccount({
      account,
    });

  const count = useMemo(
    () => accountQuery.data?.count ?? 0,
    [accountQuery.data?.count]
  );

  const channel = {} as any; // TODO: fetch from program
  const { subject, posts, post_count } = channel;

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          {/* Header */}
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {subject} with {post_count} {post_count > 1 ? "posts" : "post"}
          </h2>

          {/* Add post button */}
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => {
                const postContent = window.prompt(
                  "Set post content to:",
                  count.toString() ?? "0"
                );
                if (!postContent || postContent === "") {
                  return;
                }
                return createPostMutation.mutateAsync(postContent);
              }}
              disabled={createPostMutation.isPending}
            >
              Create post
            </button>
          </div>

          {/* Posts */}
          <div>
            {posts.map((post: any, index: number) => {
              return (
                <div key={index}>
                  <h3>{post.author}</h3>
                  <p>{post.content}</p>
                  <p>
                    <i>
                      Created at {new Date(post.timestamp).toLocaleDateString()}
                    </i>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
