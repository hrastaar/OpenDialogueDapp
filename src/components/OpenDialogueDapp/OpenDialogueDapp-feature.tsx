'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useOpenDialogueDappProgram } from './OpenDialogueDapp-data-access'
import { OpenDialogueDappCreate, OpenDialogueDappList } from './OpenDialogueDapp-ui'

export default function OpenDialogueDappFeature() {
  const { publicKey } = useWallet()
  const { programId } = useOpenDialogueDappProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Open Dialogue"
        subtitle={
          'Create a new Channel by clicking the "Create channel" button. Then you and others can add Posts to that Channel.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <OpenDialogueDappCreate />
      </AppHero>
      <OpenDialogueDappList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
