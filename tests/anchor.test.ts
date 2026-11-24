escribe("ROE Protocol V2", () => {
  it("Verifies automated revenue sharing", async () => {
    const expert = web3.Keypair.generate();
    const buyer = web3.Keypair.generate();
    const product = web3.Keypair.generate();
    const treasury = pg.wallet.publicKey;
    const price = new BN(100000000);

    // Fund test wallets
    const funding = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: treasury,
        toPubkey: expert.publicKey,
        lamports: 100000000,
      }),
      web3.SystemProgram.transfer({
        fromPubkey: treasury,
        toPubkey: buyer.publicKey,
        lamports: 200000000,
      })
    );

   await pg.program.provider.sendAndConfirm(funding);

    // Register educational product
    await pg.program.methods
      .registerProduct("Caviar Mindset: Wealth Fundamentals", price)
      .accounts({
        product: product.publicKey,
        expert: expert.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([product, expert])
      .rpc();

    // Derive purchase receipt address
    const [receipt] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        product.publicKey.toBuffer(),
        buyer.publicKey.toBuffer(),
      ],
      pg.program.programId
    );

    const expertBefore = await pg.connection.getBalance(
      expert.publicKey
    );
    const vaultBefore = await pg.connection.getBalance(treasury);

    // Purchase educational product
    const tx = await pg.program.methods
      .purchaseProduct()
      .accounts({
        product: product.publicKey,
        buyer: buyer.publicKey,
        expert: expert.publicKey,
        treasury: treasury,
        receipt: receipt,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    await pg.connection.confirmTransaction(tx);

    const expertAfter = await pg.connection.getBalance(
      expert.publicKey
    );
    const vaultAfter = await pg.connection.getBalance(treasury);

    const txDetails = await pg.connection.getTransaction(tx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    assert(txDetails !== null && txDetails.meta !== null);

    
const keys = txDetails.transaction.message.staticAccountKeys
  || txDetails.transaction.message.accountKeys;

const expertIndex = keys.findIndex(
  (key) => key.equals(expert.publicKey)
);

const vaultIndex = keys.findIndex(
  (key) => key.equals(treasury)
);

const meta = txDetails.meta;

const expertReceived =
  meta.postBalances[expertIndex] -
  meta.preBalances[expertIndex];

const vaultReceived =
  meta.postBalances[vaultIndex] -
  meta.preBalances[vaultIndex] +
  (vaultIndex === 0 ? meta.fee : 0);

    const productData = await pg.program.account.product.fetch(
      product.publicKey
    );
    const receiptData = await pg.program.account.receipt.fetch(
      receipt
    );

console.log("Expert received:", expertReceived);
console.log("Vault received:", vaultReceived);
console.log("Transaction fee:", txDetails.meta.fee);
console.log("Total sales:", productData.totalSales.toString());
console.log("Receipt amount:", receiptData.amount.toString());
console.log("Buyer matches:", receiptData.buyer.equals(buyer.publicKey));
console.log("Product matches:", receiptData.product.equals(product.publicKey));

    assert(expertReceived === 70000000);
    assert(vaultReceived === 30000000);
    assert(productData.totalSales.eq(new BN(1)));
    assert(receiptData.amount.eq(price));
    assert(receiptData.buyer.equals(buyer.publicKey));
    assert(receiptData.product.equals(product.publicKey));

    console.log("Expert received:", expertReceived / 1e9, "SOL");
    console.log("Roe Vault received:", vaultReceived / 1e9, "SOL");
    console.log("Total sales:", productData.totalSales.toString());
    console.log("Receipt:", receipt.toString());
    console.log("Transaction:", tx);
    console.log("ROE revenue sharing successful!");
  });
});
