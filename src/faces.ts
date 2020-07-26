export interface StateInterface {
  ticker: string;
  balances: BalancesInterface;
  lockedBalances: LockedBalanceInterface;
  votes: VoteInterface[];
  quorum: number;
  support: number;
  voteLength: number;
  lockMinLength: number;
  lockMaxLength: number;
}

export interface BalancesInterface {
  [key: string]: number;
}

export interface LockedBalanceInterface {
  [key: string]: LockedParamsInterface[];
}

export interface LockedParamsInterface {
  balance: number;
  lockLength: number;
  start: number;
}

export interface ActionInterface {
  input: InputInterface;
  caller: string;
}

export interface InputInterface extends VoteInterface {
  function: 'transfer' | 'balance' | 'vote' | 'propose' | 'finalize' | 'lock' | 'unlock' | 'lockedBalance';
  target?: string;
  id?: string;
  cast?: string;
}

export interface VoteInterface {
  status?: 'active' | 'quorumFailed' | 'passed' | 'failed';
  type?: 'mint' | 'mintLocked' | 'indicative' | 'set';
  recipient?: string;
  qty?: number;
  key?: string;
  value?: any;
  note?: string;
  yays?: number;
  nays?: number;
  voted?: string[];
  start?: number;
  lockLength?: number;
}