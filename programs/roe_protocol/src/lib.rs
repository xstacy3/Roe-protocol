use anchor_spl::token::{
    self, Mint, Token, TokenAccount, TransferChecked
};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::pubkey;

declare_id!("AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb");

pub const TREASURY: Pubkey =
    pubkey!("ABnixr4SdbKJnArjXfjo2ngRW958p91jKZuzTMdjFJbP");
pub const USDC_MINT: Pubkey =
    pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
#[program]
pub mod roe_protocol {
    use super::*;

pub fn issue_certificate(
    ctx: Context<IssueCertificate>,
) -> Result<()> {
    let certificate = &mut ctx.accounts.certificate;

    certificate.student = ctx.accounts.receipt.buyer;
    certificate.product = ctx.accounts.product.key();
    certificate.expert = ctx.accounts.expert.key();
    certificate.issued_at = Clock::get()?.unix_timestamp;
    certificate.revoked = false;

    msg!("ROE certificate issued successfully");

    Ok(())
}

pub fn revoke_certificate(
    ctx: Context<RevokeCertificate>,
) -> Result<()> {
    ctx.accounts.certificate.revoked = true;

    msg!("ROE certificate revoked");

    Ok(())
}


pub fn purchase_usdc_product(
    ctx: Context<PurchaseUsdcProduct>,
) -> Result<()> {
    let product = &mut ctx.accounts.product;

    require!(product.active, RoeError::InactiveProduct);

    let price = product.price;
    let vault_share = ((price as u128) * 30 / 100) as u64;
    let expert_share = price - vault_share;

    token::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.buyer_token.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.expert_token.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        expert_share,
        6,
    )?;

    token::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.buyer_token.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.treasury_token.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        vault_share,
        6,
    )?;

    product.total_sales = product.total_sales
        .checked_add(1)
        .ok_or(RoeError::Overflow)?;

    let receipt = &mut ctx.accounts.receipt;
    receipt.buyer = ctx.accounts.buyer.key();
    receipt.product = product.key();
    receipt.mint = ctx.accounts.mint.key();
    receipt.amount = price;

    msg!("Expert received: {}", expert_share);
    msg!("Roe Vault received: {}", vault_share);
    msg!("ROE token purchase successful");

    Ok(())
}

pub fn register_usdc_product(
    ctx: Context<RegisterUsdcProduct>,
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
    product.mint = ctx.accounts.mint.key();
    product.title = title;
    product.price = price;
    product.active = true;
    product.total_sales = 0;

    msg!("ROE USDC product registered successfully");

    Ok(())
}

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

#[derive(Accounts)]
pub struct RegisterUsdcProduct<'info> {
    #[account(
        init,
        payer = expert,
        space = 8 + 32 + 32 + 4 + 100 + 8 + 1 + 8
    )]
    pub product: Account<'info, UsdcProduct>,

    #[account(mut)]
    pub expert: Signer<'info>,

    #[account(
    address = USDC_MINT,
    constraint = mint.decimals == 6
)]
    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct UsdcProduct {
    pub expert: Pubkey,
    pub mint: Pubkey,
    pub title: String,
    pub price: u64,
    pub active: bool,
    pub total_sales: u64,
}

#[derive(Accounts)]
pub struct PurchaseUsdcProduct<'info> {
    #[account(mut, has_one = mint)]
    pub product: Account<'info, UsdcProduct>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(constraint = mint.decimals == 6)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = buyer_token.owner == buyer.key(),
        constraint = buyer_token.mint == mint.key(),
        constraint = buyer_token.key() != expert_token.key(),
        constraint = buyer_token.key() != treasury_token.key()
    )]
    pub buyer_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = expert_token.owner == product.expert,
        constraint = expert_token.mint == mint.key()
    )]
    pub expert_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_token.owner == TREASURY,
        constraint = treasury_token.mint == mint.key()
    )]
    pub treasury_token: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 32 + 8,
        seeds = [
            b"usdc_receipt",
            product.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, UsdcReceipt>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UsdcReceipt {
    pub buyer: Pubkey,
    pub product: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct IssueCertificate<'info> {
    #[account(has_one = expert)]
    pub product: Account<'info, UsdcProduct>,

    #[account(mut)]
    pub expert: Signer<'info>,

    #[account(
        has_one = product,
        constraint = receipt.mint == USDC_MINT,
        seeds = [
            b"usdc_receipt",
            product.key().as_ref(),
            receipt.buyer.as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, UsdcReceipt>,

    #[account(
        init,
        payer = expert,
        space = 8 + 32 + 32 + 32 + 8 + 1,
        seeds = [
            b"certificate",
            product.key().as_ref(),
            receipt.buyer.as_ref()
        ],
        bump
    )]
    pub certificate: Account<'info, Certificate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeCertificate<'info> {
    pub expert: Signer<'info>,

    #[account(mut, has_one = expert)]
    pub certificate: Account<'info, Certificate>,
}

#[account]
pub struct Certificate {
    pub student: Pubkey,
    pub product: Pubkey,
    pub expert: Pubkey,
    pub issued_at: i64,
    pub revoked: bool,
}
