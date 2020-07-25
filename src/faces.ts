export interface StateInterface {
  ticker: string;
  balances: BalancesInterface;
  lockedBalances: LockedBalanceInterface;
  votes: VoteInterface[];
  quorum: number;
  voteLength: number;
  lockedMaxLength: number;
}

export interface BalancesInterface {
  [key: string]: number;
}

export interface LockedBalanceInterface {
  [key: string]: {
    balance: number;
    period: number;
    start: number;
  }[];
}

export interface ActionInterface {
  input: InputInterface;
  caller: string;
}

export interface InputInterface extends VoteInterface {
  function: 'transfer' | 'balance' | 'vote' | 'propose' | 'finalize' | 'lock' | 'unlock' | 'lockedBalance';
  target: string;
  id: string;
  cast: string;
  period: number;
}

export interface VoteInterface {
  status: 'active' | 'quorumFailed' | 'passed' | 'failed';
  type: 'mint' | 'indicative' | 'set';
  recipient?: string;
  qty?: number;
  key?: string;
  value?: string;
  note: string;
  yays: number;
  nays: number;
  voted: string[];
  start: number;
}