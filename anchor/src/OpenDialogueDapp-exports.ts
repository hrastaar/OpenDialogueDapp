// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import OpenDialogueDappIDL from '../target/idl/open_dialogue_dapp.json'
import type { OpenDialogueDapp } from '../target/types/open_dialogue_dapp'

// Re-export the generated IDL and type
export { OpenDialogueDapp, OpenDialogueDappIDL }

// The programId is imported from the program IDL.
export const OPEN_DIALOGUE_DAPP_PROGRAM_ID = new PublicKey(OpenDialogueDappIDL.address)

// This is a helper function to get the OpenDialogueDapp Anchor program.
export function getOpenDialogueDappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...OpenDialogueDappIDL, address: address ? address.toBase58() : OpenDialogueDappIDL.address } as OpenDialogueDapp, provider)
}

// This is a helper function to get the program ID for the OpenDialogueDapp program depending on the cluster.
export function getOpenDialogueDappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the OpenDialogueDapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return OPEN_DIALOGUE_DAPP_PROGRAM_ID
  }
}
