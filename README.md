# DAO Garden SmartWeave Specs

DAO Garden is a DAO UI and library (in Javascript), to create new DAOs on top of the DAO SmartWeave contract, these are the contract's specs.

**Holders** = DAO Token Holders.

The DAO state has the following structure:
```typescript
{
  ticker: string,
  balances: {
    [key: string]: number // Positive integer
  },
  lockedBalances: {
    [key: string]: [{
      balance: number, // Positive integer
      lockLength: number, // How many blocks to lock this balance.
      start: number // At what block the lock starts.
    }]
  },
  votes: VoteInterface[], 
  quorum: number, // quorum is between 0.1 and 0.99
  voteLength: number, // How many blocks to leave a proposal open
  lockMinLength: number, // Minimum lockLength allowed
  lockMaxLength: number // Maximum lockLength allowed
}
```

Here's an example of what the state when creating the contract should look like:
```json
{
  "ticker": "TICK",
  "balances": {
    "uhE-QeYS8i4pmUtnxQyHD7dzXFNaJ9oMK-IM-QPNY6M": 10000000
  },
  "lockedBalances": {},
  "votes": [],
  "quorum": 0.5,
  "voteLength": 2000,
  "lockMinLength": 100,
  "lockMaxLength": 10000
}
```

**VoteInterface** is:
```typescript
interface VoteInterface {
  status?: 'active' | 'quorumFailed' | 'passed' | 'failed';
  type?: 'mint' | 'mintLocked' | 'indicative' | 'set';
  recipient?: string;
  qty?: number;
  key?: string;
  value?: string;
  note?: string;
  yays?: number;
  nays?: number;
  voted?: string[];
  start?: number;
  lockLength?: number;
}
```

### Transfer
Holders are able to transfer them to someone else on Arweave, not only to other DAO members but to anyone else.
#### Requires: 
- **target**: To whom the balance is going to be transfered.
- **qty**: How many tokens to transfer.

#### Returns:
`{ state }`

### Balance
Check the current balance of an account.

#### Optional:
- **target**: To whom check the balance. If not provided, caller is used.

#### Returns:
```jsonld
result: {
    target: address,
    balance: target's balance
}
```

## Locking System

### Lock
Lock a balance to increase it's vote weight on the DAO. The voting weight is: `balance + (lockedBalance * lockLength)`.

#### Requires:
- **qty**: Balance amount to lock.
- **lockLength**: How many blocks *qty* will be locked.

#### Returns:
`{ state }`

### Unlock
Unlock all locked balances that are over the *lockLength* set while locking.

#### Returns:
`{ state }`

### LockedBalance
Check the current balance of an account.

#### Optional:
- **target**: To whom check the balance. If not provided, caller is used.

## Voting System

### Propose
Holders are able to propose a new vote, this will create a new proposal.

#### Requires:
**type**: Vote type. One of the following:

- **Mint**
  To mint tokens to an Arweave address.
  Requires:
  - **recipient**: Arweave address recipient
  - **qty**: Amount of tokens to mint
  - **note**: Proposal description
- **MintLocked**
  To mint locked tokens to an Arweave address.
  - **recipient**: Arweave address recipient
  - **qty**: Amount of tokens to mint
  - **note**: Proposal description
  - **lockLength**: How many blocks *qty* will be locked.
- **Set**
  To update the DAO settings.
  Requires:
  - **key**: Setting key
  - **value**: Setting value
- **Indicative**
  To send a general non-fixed proposal. A yes/no question.
  Requires:
  - **note**: Proposal description

#### Returns:
`state`

### Vote
Cast a vote on one of the proposals.

#### Requires:
- **id**: Proposal ID.
- **cast**: What vote are you casting `'yay' || 'nay'`.

#### Returns:
`state`

### Finalize
After a vote is concluded, we should call finalize to make it in effect. It will update the vote status to `passed`, and execute if needed, or `failed`.

#### Requires:
- **id**: Proposal ID.

#### Returns:
`state`