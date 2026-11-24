se anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::pubkey;

declare_id!("AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb");

pub const TREASURY: Pubkey =
    pubkey!("ABnixr4SdbKJnArjXfjo2ngRW958p91jKZuzTMdjFJbP");

#[program]
pub mod roe_protocol {
    use super::*;

    pub fn register_product(
        ctx: Context<RegisterProduct>,
        title: String,
        price: u64,
    ) -> Result<()> {
        require!(
            !title.is_empty() && title.len() <= 100,
            RoeError::InvalidTitle
        );
        require!(price > 0, RoeError::InvalidPrice);

        let product = &mut ctx.accounts.product;
        product.expert = ctx.accounts.expert.key();
        product.title = title;
        product.price = price;
        product.active = true;
        product.total_sales = 0;

        msg!("ROE product registered successfully");
        Ok(())
    }

    pub fn purchase_product(
        ctx: Context<PurchaseProduct>,
    ) -> Result<()> {
        let product = &mut ctx.accounts.product;

        require!(product.active, RoeError::InactiveProduct);

        let price = product.price;

        let vault_share = ((price as u128) * 30 / 100) as u64;
        let expert_share = price - vault_share;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.expert.to_account_info(),
                },
            ),
            expert_share,
        )?;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            vault_share,
        )?;

        product.total_sales = product.total_sales
            .checked_add(1)
            .ok_or(RoeError::Overflow)?;

        let receipt = &mut ctx.accounts.receipt;
        receipt.buyer = ctx.accounts.buyer.key();
        receipt.product = product.key();
        receipt.amount = price;

        msg!("Expert received: {} lamports", expert_share);
        msg!("Roe Vault received: {} lamports", vault_share);
        msg!("Purchase completed successfully");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterProduct<'info> {
    #[account(
        init,
        payer = expert,
        space = 8 + 32 + 4 + 100 + 8 + 1 + 8
    )]
    pub product: Account<'info, Product>,

    #[account(mut)]
    pub expert: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseProduct<'info> {
    #[account(mut, has_one = expert)]
    pub product: Account<'info, Product>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub expert: SystemAccount<'info>,

    #[account(mut, address = TREASURY)]
    pub treasury: SystemAccount<'info>,

    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 8,
        seeds = [
            b"receipt",
            product.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, Receipt>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Product {
    pub expert: Pubkey,
    pub title: String,
    pub price: u64,
    pub active: bool,
    pub total_sales: u64,
}

#[account]
pub struct Receipt {
    pub buyer: Pubkey,
    pub product: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum RoeError {
    #[msg("Product title must be 1-100 bytes.")]
    InvalidTitle,

    #[msg("Price must be greater than zero.")]
    InvalidPrice,

    #[msg("Product is not active.")]
    InactiveProduct,

    #[msg("Arithmetic overflow.")]
    Overflow,
}
