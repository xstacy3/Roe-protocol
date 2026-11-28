
describe("ROE Protocol V6 - Holder Eligibility", () => {
  const program = pg.program;
  const authority = pg.wallet.publicKey;
  const expert = web3.Keypair.generate();
  const student = web3.Keypair.generate();
  const attacker = web3.Keypair.generate();
  const product = web3.Keypair.generate();
  const premium = web3.Keypair.generate();

  const mint = new web3.PublicKey(
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
  );

  const systemProgram = web3.SystemProgram.programId;

  function pda(seeds) {
    return web3.PublicKey.findProgramAddressSync(
      seeds,
      program.programId
    )[0];
  }

  const holderProgram = pda([
    Buffer.from("holder_program"),
    product.publicKey.toBuffer(),
  ]);

  const premiumHolderProgram = pda([
    Buffer.from("holder_program"),
    premium.publicKey.toBuffer(),
  ]);

  const certificate = pda([
    Buffer.from("certificate"),
    product.publicKey.toBuffer(),
    student.publicKey.toBuffer(),
  ]);

  const premiumCertificate = pda([
    Buffer.from("certificate"),
    premium.publicKey.toBuffer(),
    student.publicKey.toBuffer(),
  ]);

  async function expectRejection(action, pattern, label) {
    let rejected = false;

    try {
      await action();
    } catch (error) {
      const details =
        String(error) + " " + (error.logs || []).join(" ");

      console.log("Rejection:", details);
      rejected = pattern.test(details);
    }

    assert.ok(rejected, label + " failed");
    console.log("PASS:", label);
  }

  it("Verifies holder eligibility and security", async () => {
    const funding = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: authority,
        toPubkey: expert.publicKey,
        lamports: 30000000,
      }),
      web3.SystemProgram.transfer({
        fromPubkey: authority,
        toPubkey: student.publicKey,
        lamports: 1000000,
      }),
      web3.SystemProgram.transfer({
        fromPubkey: authority,
        toPubkey: attacker.publicKey,
        lamports: 10000000,
      })
    );

    await program.provider.sendAndConfirm(funding, []);

    for (const item of [product, premium]) {
      await program.methods
        .registerUsdcProduct(
          "CAVIAR MINDSET Test Program",
          new BN(1000000)
        )
        .accounts({
          product: item.publicKey,
          expert: expert.publicKey,
          mint: mint,
          systemProgram: systemProgram,
        })
        .signers([expert, item])
        .rpc();
    }

    console.log("PASS: Test programs registered");

    const registrationAccounts = {
      product: product.publicKey,
      authority: authority,
      holderProgram: holderProgram,
      systemProgram: systemProgram,
    };

    await expectRejection(
      () =>
        program.methods
          .registerHolderProgram()
          .accounts({
            ...registrationAccounts,
            authority: attacker.publicKey,
          })
          .signers([attacker])
          .rpc(),
      /ConstraintAddress/i,
      "Unauthorized holder program registration blocked"
    );

    const registrationTx = await program.methods
      .registerHolderProgram()
      .accounts(registrationAccounts)
      .rpc();

    const registrationConfirmation =
      await pg.connection.confirmTransaction(
        registrationTx,
        "finalized"
      );

    assert.ok(registrationConfirmation.value.err === null);

    const designation =
      await program.account.holderProgram.fetch(
        holderProgram,
        "finalized"
      );

    assert.ok(designation.enabled);
    assert.ok(designation.product.equals(product.publicKey));

    console.log("PASS: Holder program registered");

    const accounts = {
      product: product.publicKey,
      expert: expert.publicKey,
      authority: authority,
      student: student.publicKey,
      holderProgram: holderProgram,
      certificate: certificate,
      systemProgram: systemProgram,
    };

    await expectRejection(
      () =>
        program.methods
          .issueHolderCertificate()
          .accounts({
            ...accounts,
            authority: attacker.publicKey,
          })
          .signers([expert, student, attacker])
          .rpc(),
      /ConstraintAddress/i,
      "Unauthorized Roe Vault approval blocked"
    );

    await expectRejection(
      () =>
        program.methods
          .issueHolderCertificate()
          .accounts({
            ...accounts,
            product: premium.publicKey,
            holderProgram: premiumHolderProgram,
            certificate: premiumCertificate,
          })
          .signers([expert, student])
          .rpc(),
      /AccountNotInitialized|3012/i,
      "Free premium certificate blocked"
    );

    const certificateTx = await program.methods
      .issueHolderCertificate()
      .accounts(accounts)
      .signers([expert, student])
      .rpc();

    const confirmation =
      await pg.connection.confirmTransaction(
        certificateTx,
        "finalized"
      );

    assert.ok(confirmation.value.err === null);

    const data =
      await program.account.certificate.fetch(
        certificate,
        "finalized"
      );

    assert.ok(data.student.equals(student.publicKey));
    assert.ok(data.product.equals(product.publicKey));
    assert.ok(data.expert.equals(expert.publicKey));
    assert.ok(data.revoked === false);

    console.log("PASS: Free holder certificate issued");
    console.log("Certificate:", certificate.toBase58());
    console.log("Transaction:", certificateTx);

    await expectRejection(
      () =>
        program.methods
          .issueHolderCertificate()
          .accounts(accounts)
          .signers([expert, student])
          .rpc(),
      /already in use|already initialized/i,
      "Duplicate holder certificate blocked"
    );

    console.log("ALL ROE V6 HOLDER TESTS PASSED!");
  });
});
