import { StateInterface, ActionInterface, VoteInterface, BalancesInterface, InputInterface, LockedBalanceInterface, LockedParamsInterface } from "./faces";

declare const ContractError: any;
declare const SmartWeave: any;

export function handle(state: StateInterface, action: ActionInterface) {

  const balances: BalancesInterface = state.balances;
  const lockedBalances: LockedBalanceInterface = state.lockedBalances;
  const votes: VoteInterface[] = state.votes;
  const input: InputInterface = action.input;
  const caller: string = action.caller;
  const voteLength: number = state.voteLength;
  const quorum: number = state.quorum;

  /** Transfer Function */
  if (input.function === 'transfer') {
    const target = input.target;
    const qty = input.qty;

    if (!Number.isInteger(qty)) {
      throw new ContractError('Invalid value for "qty". Must be an integer.');
    }

    if (!target) {
      throw new ContractError('No target specified.');
    }

    if (qty <= 0 || caller === target) {
      throw new ContractError('Invalid token transfer.');
    }

    if (balances[caller] < qty) {
      throw new ContractError(`Caller balance not high enough to send ${qty} token(s)!`);
    }

    // Lower the token balance of the caller
    balances[caller] -= qty;

    if (target in balances) {
      // Wallet already exists in state, add new tokens
      balances[target] += qty;
    } else {
      // Wallet is new, set starting balance
      balances[target] = qty;
    }

    return { state };
  }

  /** Balance Function */
  if (input.function === 'balance') {
    const target = input.target;
    
    if (typeof target !== 'string') {
      throw new ContractError('Must specificy target to get balance for.');
    }

    if (typeof balances[target] !== 'number') {
      throw new ContractError('Cannnot get balance, target does not exist');
    }

    return { result: { target, balance: balances[target] } };
  }

  /** Lock System **/

  /** Lock Function */
  if(input.function === 'lock') {
    const qty = input.qty;
    const period = input.lockedLength;

    if(!Number.isInteger(qty) || qty <= 0) {
      throw new ContractError('Quantity must be a positive integer.');
    }

    if(!Number.isInteger(period) || period <= 0 || period > state.lockedMaxLength) {
      throw new ContractError(`Period is out of range. Max period is ${state.lockedMaxLength}`);
    }

    const balance = balances[caller];
    if(isNaN(balance) || balance < qty) {
      throw new ContractError('Not enough balance.');
    }

    balances[caller] -= qty;
    if (caller in lockedBalances) {
      // Wallet already exists in state, add new tokens
      lockedBalances[caller].push({
        balance: qty,
        period,
        start: SmartWeave.block.height
      });
    } else {
      // Wallet is new, set starting balance
      lockedBalances[caller] = [{
        balance: qty,
        period,
        start: SmartWeave.block.height
      }];
    }

    return { state };
  }

  /** Unlock Function */
  if(input.function === 'unlock') {
    // After the time has passed for locked tokens, unlock them calling this function.
    if(caller in lockedBalances) {
      let i = lockedBalances[caller].length;
      while(i--) {
        const locked = lockedBalances[caller][i];
        if((locked.start + locked.period) >= SmartWeave.block.height) {
          // Unlock
          balances[caller] += locked.balance;
          lockedBalances[caller].splice(i, 1);
        }
      }
    }

    return { state };
  }

  /** LockedBalance Function */
  if(input.function === 'lockedBalance') {
    let balance = 0;
    if(caller in lockedBalances) {
      const filtered = lockedBalances[caller].filter(a => {
        return ((a.start + a.period) < SmartWeave.block.height);
      });

      for(let i = 0, j = filtered.length; i < j; i++) {
        balance += filtered[i].balance;
      }
    }

    return { result: { caller, balance} };
  }

  /** Propose Function */
  if (input.function === 'propose') {
    const voteType = input.type;

    const note = input.note;
    if(typeof note !== 'string') {
      throw new ContractError('Note format not recognized.');
    }

    let hasBalance = (Number.isInteger(balances[caller]) && balances[caller] > 0);
    if(!hasBalance) {
      hasBalance = (lockedBalances[caller] && !!lockedBalances[caller].filter(a => a.balance > 0).length);
    }

    if(!hasBalance) {
      throw new ContractError('Only PST holders can propose a vote.');
    }

    let vote: VoteInterface = {
      status: 'active',
      type: voteType,
      note,
      yays: 0,
      nays: 0,
      voted: [],
      start: SmartWeave.block.height
    };

    if (voteType === 'mint' || voteType === 'mintLocked') {
      const recipient = input.recipient;
      const qty = input.qty;

      if (!recipient) {
        throw new ContractError('No recipient specified');
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new ContractError('Invalid value for "qty". Must be a positive integer.');
      }

      let lockedLength = {};
      if(input.lockedLength) {
        if(!Number.isInteger(input.lockedLength)) {
          throw new ContractError('Invalid value for "lockedLength". Must be a positive integer.');
        }

        lockedLength = { lockedLength: input.lockedLength };
      }
      
      vote = {... vote, ...{
        recipient,
        qty: qty,
      }, ...lockedLength };

      votes.push(vote);
    }

    if (voteType === 'set') {
      if (typeof input.key !== "string") {
        throw new ContractError('Data type of key not supported.');
      }

      // TODO: Add validators

      vote = {...vote, ...{
        'key': input.key,
        'value': input.value
      }};
      
      votes.push(vote);
    }

    if (voteType === 'indicative') {
      votes.push(vote);
    }

    return { state };
  }

  /** Vote Function */
  if (input.function === 'vote') {
    const id = input.id;
    const cast = input.cast;

    if (!Number.isInteger(id)) {
      throw new ContractError('Invalid value for "id". Must be an integer.');
    }

    const vote = votes[id];
    
    let voterBalance = balances[caller] || 0;
    if(caller in lockedBalances) {
      for(let i = 0, j = lockedBalances[caller].length; i < j; i++) {
        const locked = lockedBalances[caller][i];
        if((locked.start + locked.period) < SmartWeave.block.height) {
          voterBalance += (locked.balance * locked.period);
        }
      }
    }

    if (!Number.isInteger(voterBalance)) {
      throw new ContractError('Voter does not have a balance.');
    }

    if (vote.voted.includes(caller)) {
      throw new ContractError('Caller has already voted.');
    }

    if ((vote.start + voteLength) >= SmartWeave.block.height) {
      throw new ContractError('Vote has already concluded.');
    }

    if (cast == 'yay') {
      vote.yays += voterBalance;
    } else if (cast == 'nay') {
      vote.nays += voterBalance;
    } else {
      throw new ContractError('Vote cast type unrecognised.');
    }

    vote.voted.push(caller);
    return { state };
  }

  /** Finalize Function */
  if (input.function === 'finalize') {
    const id: string = input.id;
    const vote: VoteInterface = votes[id];
    const qty: number = vote.qty;

    if ((vote.start + voteLength) < SmartWeave.block.height) {
      throw new ContractError('Vote has not yet concluded.');
    }

    if (vote.status !== 'active') {
      throw new ContractError('Vote is not active.');
    }

    const totalSupply = sum(balances);

    if((totalSupply * quorum) > (vote.yays + vote.nays)) {
      vote.status = 'quorumFailed';
      return state;
    }

    if (vote.yays > vote.nays) {
      vote.status = 'passed';

      if (vote.type === 'mint') {
        if (vote.recipient in balances) {
          // Wallet already exists in state, add new tokens
          balances[vote.recipient] += qty;
        } else {
          // Wallet is new, set starting balance
          balances[vote.recipient] = qty;
        }

      } else if(vote.type === 'mintLocked') {
        const locked: LockedParamsInterface = {
          balance: qty,
          start: SmartWeave.block.height,
          period: vote.lockedLength
        };

        if(vote.recipient in lockedBalances) {
          // Existing account
          lockedBalances[vote.recipient].push(locked);
        } else {
          // New locked account
          lockedBalances[vote.recipient] = [locked];
        }
      } else if (vote.type === 'set') {
        state[vote.key] = vote.value;
      }

    } else {
      vote.status = 'failed';
    }

    return { state };
  }

  throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
}

function sum(obj) {
  return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
}