use anchor_lang::prelude::*; // import

// program id
// has info for solana on how to run program (macro)
// http://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/macros.html\
// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
declare_id!("81WCDqFWWYkpxdu2qLBs1ciAJzvukT6rDQXvBpStyQhh"); // project id

#[program]
pub mod myepicproject {
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        // Get a reference to the account.
        let base_account = &mut ctx.accounts.base_account;
        // Initialize total_gifs.
        base_account.total_gifs = 0;
        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>, gif_link: String, gif_pun: String) -> ProgramResult {
        // Get a reference to the account and increment total_gifs.
        let base_account = &mut ctx.accounts.base_account;
        // Build the struct.
        let item = ItemStruct {
            gif_link: gif_link.to_string(),
            gif_pun: gif_pun.to_string(),
            user_address: *base_account.to_account_info().key,
        };

        // Add it to the gif_list vector.
        base_account.gif_list.push(item);
        base_account.total_gifs += 1;
        Ok(())
    }
}

// Attach certain variables to the StartStuffOff context.
#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    // init - tell solana to create new acct owned by current program
    // payer - tells program who is payinig. so payer is the user that calls the function
    // space = 9000, allocate 9000 bytes of space to the account
    #[account(init, payer = user, space = 9000)] // tell solana how to create base account
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>, // data passed to the program
    pub system_program: Program<'info, System>, // reference to program that runs solana
}

// Specify what data you want in the AddGif Context.
#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)] // tells Anchor how to serialize/deserialize the struct
pub struct ItemStruct {
    pub gif_link: String,
    pub gif_pun: String,
    pub user_address: Pubkey,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_gifs: u64,
    pub gif_list: Vec<ItemStruct>, // Vector of type ItemStruct to the account.
}
