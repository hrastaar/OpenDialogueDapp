import { PublicKey } from '@solana/web3.js';

// Program ID
const programId = new PublicKey("G8mo1d8uvteT3Hu4Vqn6rRgD2dYq89CMn7rMZiac2ZEo");

// Subject public key
const subjectPublicKey = new PublicKey("8jyAH4dEKgX7ZckJeYXqQVYZ9jFrZ9N33cipZUt7L7Ee");

// Derive the PDA
const [channelPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("channel"), subjectPublicKey.toBuffer()],
    programId
);

console.log("Channel PDA Generated:", channelPda.toBase58());

// Inputs
let postsLength = 0; // Retrieved from channel.posts.length

// Derive the Post PDA
const [postPda, _bump] = PublicKey.findProgramAddressSync(
    [
        Buffer.from("post"),
        subjectPublicKey.toBuffer(),
        new Uint8Array(new BN(postsLength).toArray("le", 8)), // Convert length to little-endian
    ],
    programId
);
console.log("First Post PDA Generated:", postPda.toBase58());

postsLength = 1;

// Derive the Post PDA
const [postPda2, bump2] = PublicKey.findProgramAddressSync(
    [
        Buffer.from("post"),
        subjectPublicKey.toBuffer(),
        new Uint8Array(new BN(postsLength).toArray("le", 8)), // Convert length to little-endian
    ],
    programId
);
console.log("Second Post PDA Generated:", postPda2.toBase58());