import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {OpenDialogueDapp} from '../target/types/OpenDialogueDapp'

describe('OpenDialogueDapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.OpenDialogueDapp as Program<OpenDialogueDapp>

  const OpenDialogueDappKeypair = Keypair.generate()

  it('Initialize OpenDialogueDapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        OpenDialogueDapp: OpenDialogueDappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([OpenDialogueDappKeypair])
      .rpc()

    const currentCount = await program.account.OpenDialogueDapp.fetch(OpenDialogueDappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment OpenDialogueDapp', async () => {
    await program.methods.increment().accounts({ OpenDialogueDapp: OpenDialogueDappKeypair.publicKey }).rpc()

    const currentCount = await program.account.OpenDialogueDapp.fetch(OpenDialogueDappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment OpenDialogueDapp Again', async () => {
    await program.methods.increment().accounts({ OpenDialogueDapp: OpenDialogueDappKeypair.publicKey }).rpc()

    const currentCount = await program.account.OpenDialogueDapp.fetch(OpenDialogueDappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement OpenDialogueDapp', async () => {
    await program.methods.decrement().accounts({ OpenDialogueDapp: OpenDialogueDappKeypair.publicKey }).rpc()

    const currentCount = await program.account.OpenDialogueDapp.fetch(OpenDialogueDappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set OpenDialogueDapp value', async () => {
    await program.methods.set(42).accounts({ OpenDialogueDapp: OpenDialogueDappKeypair.publicKey }).rpc()

    const currentCount = await program.account.OpenDialogueDapp.fetch(OpenDialogueDappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the OpenDialogueDapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        OpenDialogueDapp: OpenDialogueDappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.OpenDialogueDapp.fetchNullable(OpenDialogueDappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
