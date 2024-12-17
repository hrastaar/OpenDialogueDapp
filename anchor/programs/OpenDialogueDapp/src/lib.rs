use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod open_dialogue_dapp {
    use super::*;

    // Create a channel
    pub fn create_channel(ctx: Context<CreateChannel>, subject: Pubkey) -> Result<()> {
      let channel = &mut ctx.accounts.channel;
      channel.subject = subject;
      channel.posts = Vec::new();
      Ok(())
    }

    // Create a post in a channel
    pub fn create_post(ctx: Context<CreatePost>, content: String) -> Result<()> {
      let post = &mut ctx.accounts.post;
      let author = &ctx.accounts.author;
      let clock: Clock = Clock::get().unwrap();

      post.content = content;
      post.timestamp = clock.unix_timestamp;
      post.author = author.key();
      post.channel = ctx.accounts.channel.key();

      let channel = &mut ctx.accounts.channel;
      channel.posts.push(post.key());
      Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateChannel<'info> {
  #[account(mut)]
  pub author: Signer<'info>,

  #[account(init, payer = author, space = Channel::INIT_SPACE)]
  pub channel: Account<'info, Channel>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {            
    #[account(init, 
        seeds = [
            &channel.posts.len().to_be_bytes(), 
            channel.key().as_ref()
        ], 
        bump, 
        payer = author, 
        space=Post::INIT_SPACE
    )]
    pub post: Account<'info, Post>,        
    #[account(mut)]                                 
    pub author: Signer<'info>,  
    #[account(mut)]       
    pub channel: Account<'info, Channel>,      
    pub system_program: Program<'info, System>,    
}

#[account]
pub struct Channel {
  pub subject: Pubkey,
  pub posts: Vec<Pubkey>
}

impl Channel {
  pub const INIT_SPACE: usize = 8 + 32 + (4 + 25 * (4 + 64));
}

#[account]
#[derive(InitSpace)]
pub struct Post {
  pub channel: Pubkey,
  #[max_len(128)]
  pub content: String,
  pub timestamp: i64,
  pub author: Pubkey,
}
