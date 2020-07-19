/**
 * DAOGarden SmartWeave Main Contract
 * It holds all the DAOs addys and their configuration.
 */

export async function handle(state, action) {
  const input = action.input;

  if(input.function === 'register') {
    const name = input.name;
    const pst = input.pst;
    const vd = +input.voteDuration;
    const minApproval = +input.minApproval;
    const support = +input.support;

    if(typeof name !== 'string') {
      throw new ContractError('Invalid DAO name type.');
    } else if(name < 3) {
      throw new ContractError('DAO name must be of at least 3 characters.');
    }

    if(!pst || !/^[a-z0-9-_]{43}$/i.test(pst)) {
      throw new ContractError('Invalid PST address.');
    }

    checkInteger(vd, 'Vote duration');
    checkInteger(support, 'Support');
    checkInteger(minApproval, 'Minimum approval');

    if(state.daos[name]) {
      throw new ContractError('A DAO with the same name already exists.');
    }

    state.daos[name] = {
      pst,
      vd,
      minApproval,
      support
    };

    return { state };
  }

  if(input.function === 'update') {
    const name = input.name;
    const minApproval = +input.minApproval;
    const support = +input.support;

    if(typeof name !== 'string' || !state.daos[name]) {
      throw new ContractError('Invalid DAO name.');
    }

    checkInteger(minApproval, 'Minimum approval');
    checkInteger(support, 'Support');

    const pstContractState = await SmartWeave.contracts.readContractState(state.daos[name].pst);
    if(!pstContractState.balances[action.caller]) {
      throw new ContractError('Caller doesn\'t have the right to update the DAO.');
    }
  }

  const checkInteger = (int, str) => {
    if(!int || !Number.isInteger(int)) {
      throw new ContractError(`${str} is required.`);
    }
  };

  // TODO: Another contract addy is the one that should be able to update this kind of stuff.
}