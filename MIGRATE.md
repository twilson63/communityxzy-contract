# Evolve Contract and Patch State

To evolve the contract and patch state, we need to execute on the L1, because this contract is a legacy SmartWeave contract.

## Steps to patch

1. The Contract Owners wallet needs to be placed in the root of this project and the file name should be `wallet.json`

2. Run the evolve script

```sh
npx ts-node src/migrate/evolve.ts
```

> Monitor the interaction id with viewblock and sonar to make sure the transaction is confirmed, which normally takes about 60 minutes.

3. Run the patch script

```sh
npx ts-node src/migrate/patch.ts
```

> Monitor the interaction id with viewblock and sonar to make sure the transaction is confirmed, which normally takes about 60 minutes.

4. Verify Vouch Services work!
