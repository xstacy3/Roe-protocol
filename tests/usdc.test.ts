import * as splToken from "@solana/spl-token";

describe("ROE Protocol V3 Token Payments", () => {
  it("Verifies 70/30 token revenue sharing", async () => {
    const expert = web3.Keypair.generate();
    const buyer = web3.Keypair.generate();
    const product = web3.Keypair.generate();
    const mint = web3.Keypair.generate();
    const treasury = pg.wallet.publicKey;
    const price = new BN(49000000);

    const rent = await pg.connection
      .getMinimumBalanceForRentExemption(splToken.MINT_SIZE);

    const setup = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: treasury,
        toPubkey: expert.publicKey,
        lamports: 30000000,
      }),
      web3.SystemProgram.transfer({
        fromPubkey: treasury,
        toPubkey: buyer.publicKey,
        lamports: 30000000,
      }),
      web3.SystemProgram.createAccount({
        fromPubkey: treasury,
        newAccountPubkey: mint.publicKey,
        space: splToken.MINT_SIZE,
        lamports: rent,
        programId: splToken.TOKEN_PROGRAM_ID,
      }),
      splToken.createInitializeMintInstruction(
        mint.publicKey,
        6,
        treasury,
        null
      )
    );

    await pg.program.provider.sendAndConfirm(
      setup,
      [mint]
    );

    console.log("PASS: Test token created");

    const buyerToken =
      await splToken.getAssociatedTokenAddress(
        mint.publicKey,
        buyer.publicKey
      );

    const expertToken =
      await splToken.getAssociatedTokenAddress(
        mint.publicKey,
        expert.publicKey
      );

    const treasuryToken =
      await splToken.getAssociatedTokenAddress(
        mint.publicKey,
        treasury
      );

    const accounts = new web3.Transaction().add(
      splToken.createAssociatedTokenAccountInstruction(
        treasury,
        buyerToken,
        buyer.publicKey,
        mint.publicKey
      ),
      splToken.createAssociatedTokenAccountInstruction(
        treasury,
        expertToken,
        expert.publicKey,
        mint.publicKey
      ),
      splToken.createAssociatedTokenAccountInstruction(
        treasury,
        treasuryToken,
        treasury,
        mint.publicKey
      ),
      splToken.createMintToInstruction(
        mint.publicKey,
        buyerToken,
        treasury,
        100000000
      )
    );

    await pg.program.provider.sendAndConfirm(accounts);

    console.log("PASS: Token accounts created");
    console.log("Buyer funded with 100 test tokens");

    await pg.program.methods
      .registerUsdcProduct(
        "Caviar Mindset: Wealth Fundamentals",
        price
      )
      .accounts({
        product: product.publicKey,
        expert: expert.publicKey,
        mint: mint.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([product, expert])
      .rpc();

    console.log("PASS: Token product registered");

    const [receipt] =
      web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("usdc_receipt"),
          product.publicKey.toBuffer(),
          buyer.publicKey.toBuffer(),
        ],
        pg.program.programId
      );

    const tx = await pg.program.methods
      .purchaseUsdcProduct()
      .accounts({
        product: product.publicKey,
        buyer: buyer.publicKey,
        mint: mint.publicKey,
        buyerToken: buyerToken,
        expertToken: expertToken,
        treasuryToken: treasuryToken,
        receipt: receipt,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    await pg.connection.confirmTransaction(tx);

    const expertBalance =
      await pg.connection.getTokenAccountBalance(
        expertToken,
        "confirmed"
      );

    const vaultBalance =
      await pg.connection.getTokenAccountBalance(
        treasuryToken,
        "confirmed"
      );

    const buyerBalance =
      await pg.connection.getTokenAccountBalance(
        buyerToken,
        "confirmed"
      );

    const productData =
      await pg.program.account.usdcProduct.fetch(
        product.publicKey
      );

    const receiptData =
      await pg.program.account.usdcReceipt.fetch(
        receipt
      );

    assert(expertBalance.value.amount === "34300000");
    assert(vaultBalance.value.amount === "14700000");
    assert(buyerBalance.value.amount === "51000000");
    assert(productData.totalSales.eq(new BN(1)));
    assert(receiptData.amount.eq(price));
    assert(receiptData.buyer.equals(buyer.publicKey));
    assert(receiptData.product.equals(product.publicKey));
    assert(receiptData.mint.equals(mint.publicKey));

    console.log("PASS: Expert received 34.30 tokens");
    console.log("PASS: Roe Vault received 14.70 tokens");
    console.log("PASS: Buyer remaining balance 51 tokens");
    console.log("PASS: Purchase receipt verified");
    console.log("PASS: Sales counter verified");
    console.log("Transaction:", tx);
    console.log("ALL ROE TOKEN PAYMENT TESTS PASSED!");

// Security test setup
const attacker = web3.Keypair.generate();
const secondBuyer = web3.Keypair.generate();

const attackerToken =
  await splToken.getAssociatedTokenAddress(
    mint.publicKey,
    attacker.publicKey
  );

const secondBuyerToken =
  await splToken.getAssociatedTokenAddress(
    mint.publicKey,
    secondBuyer.publicKey
  );

const securitySetup = new web3.Transaction().add(
  web3.SystemProgram.transfer({
    fromPubkey: treasury,
    toPubkey: secondBuyer.publicKey,
    lamports: 30000000,
  }),
  splToken.createAssociatedTokenAccountInstruction(
    treasury,
    attackerToken,
    attacker.publicKey,
    mint.publicKey
  ),
  splToken.createAssociatedTokenAccountInstruction(
    treasury,
    secondBuyerToken,
    secondBuyer.publicKey,
    mint.publicKey
  ),
  splToken.createMintToInstruction(
    mint.publicKey,
    secondBuyerToken,
    treasury,
    100000000
  )
);

await pg.program.provider.sendAndConfirm(securitySetup);

const [secondReceipt] =
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("usdc_receipt"),
      product.publicKey.toBuffer(),
      secondBuyer.publicKey.toBuffer(),
    ],
    pg.program.programId
  );

const baseAccounts = {
  product: product.publicKey,
  buyer: secondBuyer.publicKey,
  mint: mint.publicKey,
  buyerToken: secondBuyerToken,
  expertToken: expertToken,
  treasuryToken: treasuryToken,
  receipt: secondReceipt,
  tokenProgram: splToken.TOKEN_PROGRAM_ID,
  systemProgram: web3.SystemProgram.programId,
};

// Test 1: Duplicate purchase
let duplicateBlocked = false;

try {
  await pg.program.methods
    .purchaseUsdcProduct()
    .accounts({
      ...baseAccounts,
      buyer: buyer.publicKey,
      buyerToken: buyerToken,
      receipt: receipt,
    })
    .signers([buyer])
    .rpc();
} catch (error) {
  const details = [
    String(error),
    error.logs?.join(" "),
  ].join(" ");

  duplicateBlocked =
    /already in use|already initialized/i.test(details);
}

assert(duplicateBlocked, "Duplicate protection failed");
console.log("PASS: Duplicate token purchase blocked");

// Test 2: Expert redirection
let expertBlocked = false;

try {
  await pg.program.methods
    .purchaseUsdcProduct()
    .accounts({
      ...baseAccounts,
      expertToken: attackerToken,
    })
    .signers([secondBuyer])
    .rpc();
} catch (error) {
  const details = String(error);
  expertBlocked =
    /ConstraintRaw/i.test(details) &&
    /expert_token/i.test(details);
}

assert(expertBlocked, "Expert protection failed");
console.log("PASS: Expert token redirection blocked");

// Test 3: Treasury redirection
let treasuryBlocked = false;

try {
  await pg.program.methods
    .purchaseUsdcProduct()
    .accounts({
      ...baseAccounts,
      treasuryToken: attackerToken,
    })
    .signers([secondBuyer])
    .rpc();
} catch (error) {
  const details = String(error);
  treasuryBlocked =
    /ConstraintRaw/i.test(details) &&
    /treasury_token/i.test(details);
}

assert(treasuryBlocked, "Treasury protection failed");
console.log("PASS: Treasury token redirection blocked");

// Verify no unauthorized changes
const finalProduct =
  await pg.program.account.usdcProduct.fetch(
    product.publicKey
  );

assert(finalProduct.totalSales.eq(new BN(1)));

const unauthorizedReceipt =
  await pg.connection.getAccountInfo(
    secondReceipt,
    "confirmed"
  );

assert(unauthorizedReceipt === null);

const attackerBalance =
  await pg.connection.getTokenAccountBalance(
    attackerToken,
    "confirmed"
  );

assert(attackerBalance.value.amount === "0");

const secondBuyerBalance =
  await pg.connection.getTokenAccountBalance(
    secondBuyerToken,
    "confirmed"
  );

assert(secondBuyerBalance.value.amount === "100000000");

console.log("PASS: Sales counter unchanged");
console.log("PASS: No unauthorized receipt created");
console.log("PASS: No unauthorized token transfers");
console.log("ALL ROE TOKEN SECURITY CHECKS PASSED!");
  });
});
