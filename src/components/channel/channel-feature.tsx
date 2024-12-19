"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useChannelProgram } from "./channel-data-access";
import { ChannelCreate, ChannelList } from "./channel-ui";

export default function ChannelFeature() {
  const { publicKey } = useWallet();
  const { programId } = useChannelProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Channel"
        subtitle={'Create a new channel by clicking the "Create" button.'}
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <ChannelCreate />
      </AppHero>
      <ChannelList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
