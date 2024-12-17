import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';
import { OpenDialogueDapp } from '../target/types/open_dialogue_dapp';
import { assert } from 'chai';

describe('OpenDialogueDapp', () => {
  // Use provider.env() to get the wallet from the environment
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OpenDialogueDapp as Program<OpenDialogueDapp>;
  const subject = Keypair.generate();

  before(async () => {
    // Request airdrop for the provider wallet
    const signature = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  it('Creates a new channel', async () => {
    const [channelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("channel"), subject.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .createChannel()
        .accounts({
          author: provider.wallet.publicKey,
          subject: subject.publicKey,
          channel: channelPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const channelAccount = await program.account.channel.fetch(channelPda);
      assert(channelAccount.subject.equals(subject.publicKey), "Subject doesn't match");
      assert(channelAccount.posts.length === 0, "Posts should be empty");
      assert(channelAccount.postCount === 0, "Post count should be 0");
    } catch (err) {
      console.error("Error creating channel:", err);
      throw err;
    }
  });

  it('Creates a post in the channel', async () => {
    const [channelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("channel"), subject.publicKey.toBuffer()],
      program.programId
    );

    try {
      const channelAccount = await program.account.channel.fetch(channelPda);
      const [postPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          subject.publicKey.toBuffer(),
          numberToLeBytes(channelAccount.posts.length)
        ],
        program.programId
      );

      const content = "Hello, World!";

      await program.methods
        .createPost(content)
        .accounts({
          author: provider.wallet.publicKey,
          channel: channelPda,
          post: postPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const updatedChannel = await program.account.channel.fetch(channelPda);
      const postAccount = await program.account.post.fetch(postPda);
      
      assert(updatedChannel.posts.length === 1, "Should have one post");
      assert(updatedChannel.postCount === 1, "Post count should be 1");
      assert(postAccount.content === content, "Content should match");
      assert(postAccount.author.equals(provider.wallet.publicKey), "Author should match");
    } catch (err) {
      console.error("Error creating post:", err);
      throw err;
    }
  });
});

function numberToLeBytes(num: number): Uint8Array {
  const arr = new Uint8Array(8);
  arr[0] = num;
  return arr;
}