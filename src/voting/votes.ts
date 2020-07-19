/**
 * DAOGarden SmartWeave Votes Contract
 * We have 3 different vote types:
 * - general = just a normal true/false question
 * - mint = to "mint" funds to an address
 * - ???
 */

interface ContractInteraction {
  input: {
    function: string;
    dao: string;
    name: string;
    description: string;
    type: string;
    id: string;
    vote: boolean;
  }
  caller: string;
}

interface ContractHandlerResult {
  result?: any;
  state?: {
    votes: {
      $key: {
        name: string;
        description: string;
        type: string;
        voted: {
          $key: {
            vote: boolean;
          }
        }
      }
    }
  };
}

declare const ContractError: any;
declare const SmartWeave: any;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function checkInteger(int, str) {
  if(!int || !Number.isInteger(int)) {
    throw new ContractError(`${str} is required.`);
  }
};

export async function handle(state: any, action: ContractInteraction): Promise<ContractHandlerResult> {
  const input = action.input;

  // Create a new vote
  if(input.function === 'register') {
    const dao = input.dao;
    const name = input.name;
    let description = input.description || '';
    const type = input.type;

    if(typeof dao !== 'string') {
      throw new ContractError('Invalid DAO name.');
    }

    if(typeof name !== 'string') {
      throw new ContractError('Invalid vote name.');
    } else if(name.length < 3) {
      throw new ContractError('Vote name must be of at least 3 characters.');
    }

    if(typeof description !== 'string') {
      description = '';
    }

    const pstContractState = await SmartWeave.contracts.readContractState(state.daos[dao].pst);
    if(!pstContractState.balances[action.caller]) {
      throw new ContractError('You don\'t have the rights for this action.');
    }

    state.votes[uuidv4()] = {
      name,
      description,
      type,
      voted: {}
    };

    return { state };
  }

  if(input.function === 'vote') {
    const dao: string = input.dao;
    const id: string = input.id;
    const vote: boolean = input.vote;

    if(typeof dao !== 'string') {
      throw new ContractError('Invalid DAO name.');
    }

    if(typeof id !== 'string' || !state.votes[id]) {
      throw new ContractError('Invalid Vote ID.');
    }

    if(state.votes[id].voted[action.caller]) {
      throw new ContractError('Already voted.');
    }

    const pstContractState = await SmartWeave.contracts.readContractState(state.daos[dao].pst);
    if(!pstContractState.balances[action.caller]) {
      throw new ContractError('You don\'t have the rights for this action.');
    }

    state.votes[id].voted[action.caller].vote = vote;
  }
}