export interface StateInterface {
  ticker: string;
  balances: BalancesInterface;
  vault: VaultInterface;
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

export interface VaultInterface {
  [key: string]: VaultParamsInterface[];
}

export interface VaultParamsInterface {
  balance: number;
  start: number;
  end: number;
}

export interface ActionInterface {
  input: InputInterface;
  caller: string;
}

export interface InputInterface extends VoteInterface {
  function: 'transfer' | 'balance' | 'vote' | 'propose' | 'finalize' | 'lock' | 'unlock' | 'vaultBalance';
  target?: string;
  id?: string;
  cast?: string;
}

export interface VoteInterface {
  status?: 'active' | 'quorumFailed' | 'passed' | 'failed';
  type?: 'mint' | 'mintLocked' | 'indicative' | 'set';
  totalWeight?: number;
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