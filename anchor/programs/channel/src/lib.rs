use anchor_lang::prelude::*;

declare_id!("9fPsvWHnM6BUsYhYMgsTKZe7nbpcjmuMygA9cMCEJmtc");

#[program]
pub mod channel {
    use super::*;

    // Create a channel for a subject (can only be one channel per subject)
    pub fn initialize(ctx: Context<InitializeChannel>) -> Result<()> {
        let channel = &mut ctx.accounts.channel;
        channel.subject = ctx.accounts.subject.key();
        channel.posts = Vec::new();
        channel.post_count = 0;

        Ok(())
    }

    pub fn close_channel(_ctx: Context<CloseChannel>) -> Result<()> {
        Ok(())
    }

    // Create a post in a channel
    pub fn create_post(ctx: Context<CreatePost>, content: String) -> Result<()> {
        if content.len() > 128 {
            return Err(error!(ErrorCode::ContentTooLong));
        }

        let channel = &mut ctx.accounts.channel;
        if channel.post_count >= 50 {
            return Err(error!(ErrorCode::MaximumPostsReached));
        }

        let post = &mut ctx.accounts.post;
        post.content = content;
        post.timestamp = Clock::get()?.unix_timestamp;
        post.author = ctx.accounts.author.key();

        channel.posts.push(post.key());
        channel.post_count += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeChannel<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    /// The subject account this channel is about
    /// CHECK: This is just used as a reference key
    pub subject: AccountInfo<'info>,

    #[account(
        init,
        seeds = [b"channel", subject.key().as_ref()],
        bump,
        space = Channel::SPACE,
        payer = author
    )]
    pub channel: Account<'info, Channel>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseChannel<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, close = payer)]
    pub channel: Account<'info, Channel>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        mut,
        seeds = [b"channel", channel.subject.as_ref()],
        bump,
    )]
    pub channel: Account<'info, Channel>,

    #[account(
        init,
        seeds = [b"post", channel.subject.as_ref(), &channel.posts.len().to_le_bytes()],
        bump,
        payer = author,
        space = Post::SPACE
    )]
    pub post: Account<'info, Post>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Channel {
    pub author: Pubkey,
    pub subject: Pubkey, // The subject this channel is about
    pub posts: Vec<Pubkey>, // Vector of post PDAs
    pub post_count: u8, // Number of posts (max 50)
}

impl Channel {
    pub const SPACE: usize =
        8 + // discriminator
        32 + // author pubkey
        32 + // subject pubkey
        50 * 32 + // vec of 50 post pubkeys
        8; // post_count
}

#[account]
pub struct Post {
    pub content: String,
    pub timestamp: i64,
    pub author: Pubkey,
}

impl Post {
    pub const SPACE: usize =
        8 + // discriminator
        (4 + 128) + // content string (4 bytes length + 128 bytes data)
        8 + // timestamp
        32; // author pubkey
}

#[error_code]
pub enum ErrorCode {
    #[msg("Content must be 128 characters or less")]
    ContentTooLong,
    #[msg("Channel has reached maximum of 50 posts")]
    MaximumPostsReached,
}
