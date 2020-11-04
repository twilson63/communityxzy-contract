export interface StateInterface {
  name: string;
  ticker: string;
  balances: BalancesInterface;
  vault: VaultInterface;
  votes: VoteInterface[];
  roles: RoleInterface;
  settings: [string, any][];
  modules: ModuleInterface[];
}

export interface RoleInterface {
  [key: string]: string;
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

export interface ModuleInterface {
  // Ideally, a unique, meaningful id for the module.
  id: string;
  // Priority weight of this module against other modules when running sequentially.
  priorityWeight?: number;
  // A function that runs whenever the contract is handled.
  call({state: StateInterface, action: ActionInterface}): StateInterface;
}

export interface InputInterface extends VoteInterface {
  function: GetFunctionType | SetFunctionType;
  cast?: string;
}

export interface VoteInterface {
  status?: VoteStatus;
  type?: VoteType;
  id?: number;
  totalWeight?: number;
  recipient?: string;
  target?: string;
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

export interface ResultInterface {
  target: string;
  balance: number;
  role: string;
}

export type VoteStatus = 'active' | 'quorumFailed' | 'passed' | 'failed';
export type VoteType = 'mint' | 'mintLocked' | 'burnVault' | 'indicative' | 'set';
export type GetFunctionType = 'balance' | 'unlockedBalance' | 'vaultBalance' | 'role';
export type SetFunctionType = 'transfer' | 'vote' | 'propose' | 'finalize' | 'lock' | 'increaseVault' | 'unlock';
