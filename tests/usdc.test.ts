
import * as splToken from "@solana/spl-token";

describe("ROE Protocol V4 Mint Security", () => {
  it("Rejects unofficial USDC tokens", async () => {
    const treasury = pg.wallet.publicKey;
    const mint = web3.Keypair.generate();
    const product = web3.Keypair.generate();

    const rent =
      await pg.connection.getMinimumBalanceForRentExemption(
        splToken.MINT_SIZE
      );

    const setup = new web3.Transaction().add(
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

    await pg.program.provider.sendAndConfirm(setup, [mint]);

    console.log("PASS: Unofficial test mint created");

    let blocked = false;

    try {
      await pg.program.methods
        .registerUsdcProduct(
          "Counterfeit USDC Product",
          new BN(1000000)
        )
        .accounts({
          product: product.publicKey,
          expert: treasury,
          mint: mint.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([product])
        .rpc();
    } catch (error) {
      const details = String(error);

      blocked =
        /ConstraintAddress/i.test(details) &&
        /account: mint/i.test(details);

      console.log("Rejection:", details);
    }

    assert(blocked, "Unofficial mint was not rejected");

    const unauthorizedProduct =
      await pg.connection.getAccountInfo(
        product.publicKey,
        "confirmed"
      );

    assert(unauthorizedProduct === null);

    console.log("PASS: Counterfeit token rejected");
    console.log("PASS: Unauthorized product not created");
    console.log("ALL ROE MINT SECURITY CHECKS PASSED!");
  });
});
