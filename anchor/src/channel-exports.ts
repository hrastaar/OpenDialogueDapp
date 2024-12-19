// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import ChannelIDL from '../target/idl/channel.json'
import type { Channel } from '../target/types/channel'

// Re-export the generated IDL and type
export { Channel, ChannelIDL }

// The programId is imported from the program IDL.
export const CHANNEL_PROGRAM_ID = new PublicKey(ChannelIDL.address)

// This is a helper function to get the Channel Anchor program.
export function getChannelProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...ChannelIDL, address: address ? address.toBase58() : ChannelIDL.address } as Channel, provider)
}

// This is a helper function to get the program ID for the Channel program depending on the cluster.
export function getChannelProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Channel program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return CHANNEL_PROGRAM_ID
  }
}
