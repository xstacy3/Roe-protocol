Running tests...
  anchor.test.ts:
  ROE Protocol V2
    PASS: Expert received 0.07 SOL
    PASS: Roe Vault received 0.03 SOL
    PASS: Purchase receipt verified
    PASS: Sales counter verified
    Receipt: 6cipMkT74M6ndajJrDXVM8QFmQcVQQr75u4mjnb2MEAD
    Transaction: 3uqszNXdFptPjXsqjW6cxhx3Qt1QtXjw9kTqeTzn2iVqwXpJ7Tp45e9Nt7GaQw4HXFUjkAtdUnkxpePHkcbPaiUT
    Duplicate rejection: Error: Simulation failed. 
Message: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0. 
Logs: 
[
  "Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb invoke [1]",
  "Program log: Instruction: PurchaseProduct",
  "Program 11111111111111111111111111111111 invoke [2]",
  "Allocate: account Address { address: 6cipMkT74M6ndajJrDXVM8QFmQcVQQr75u4mjnb2MEAD, base: None } already in use",
  "Program 11111111111111111111111111111111 failed: custom program error: 0x0",
  "Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb consumed 7214 of 200000 compute units",
  "Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb failed: custom program error: 0x0"
]. 
Catch the `SendTransactionError` and call `getLogs()` on it for full details. Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb invoke [1] Program log: Instruction: PurchaseProduct Program 11111111111111111111111111111111 invoke [2] Allocate: account Address { address: 6cipMkT74M6ndajJrDXVM8QFmQcVQQr75u4mjnb2MEAD, base: None } already in use Program 11111111111111111111111111111111 failed: custom program error: 0x0 Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb consumed 7214 of 200000 compute units Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb failed: custom program error: 0x0 
    PASS: Duplicate purchase blocked
    Treasury rejection: AnchorError caused by account: treasury. Error Code: ConstraintAddress. Error Number: 2012. Error Message: An address constraint was violated.
Program log: Left:
Program log: 9vLN3MBcW69w4Pt1cYdpLc1GiVo7AgpCvuEzac5BAi57
Program log: Right:
Program log: ABnixr4SdbKJnArjXfjo2ngRW958p91jKZuzTMdjFJbP Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb invoke [1] Program log: Instruction: PurchaseProduct Program 11111111111111111111111111111111 invoke [2] Program 11111111111111111111111111111111 success Program log: AnchorError caused by account: treasury. Error Code: ConstraintAddress. Error Number: 2012. Error Message: An address constraint was violated. Program log: Left: Program log: 9vLN3MBcW69w4Pt1cYdpLc1GiVo7AgpCvuEzac5BAi57 Program log: Right: Program log: ABnixr4SdbKJnArjXfjo2ngRW958p91jKZuzTMdjFJbP Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb consumed 12381 of 200000 compute units Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb failed: custom program error: 0x7dc ConstraintAddress
    PASS: Treasury redirection blocked
    Expert rejection: AnchorError caused by account: product. Error Code: ConstraintHasOne. Error Number: 2001. Error Message: A has one constraint was violated.
Program log: Left:
Program log: 4cuRmEWmYho2r7Py5ntF1QEZzTeBeycikaynEUq5BZEk
Program log: Right:
Program log: 9vLN3MBcW69w4Pt1cYdpLc1GiVo7AgpCvuEzac5BAi57 Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb invoke [1] Program log: Instruction: PurchaseProduct Program 11111111111111111111111111111111 invoke [2] Program 11111111111111111111111111111111 success Program log: AnchorError caused by account: product. Error Code: ConstraintHasOne. Error Number: 2001. Error Message: A has one constraint was violated. Program log: Left: Program log: 4cuRmEWmYho2r7Py5ntF1QEZzTeBeycikaynEUq5BZEk Program log: Right: Program log: 9vLN3MBcW69w4Pt1cYdpLc1GiVo7AgpCvuEzac5BAi57 Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb consumed 12343 of 200000 compute units Program AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb failed: custom program error: 0x7d1 ConstraintHasOne
    PASS: Expert redirection blocked
    PASS: Sales counter unchanged
    PASS: No unauthorized receipt created
    ALL ROE SECURITY CHECKS PASSED!
    ✔  Verifies revenue sharing and security (2005ms)
  1 passing (2s)
$ 
