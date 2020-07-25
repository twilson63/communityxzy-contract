require("typescript.api").register();

import * as fs from 'fs';
import * as path from 'path';
import  Arweave from 'arweave/node';
import { createContractExecutionEnvironment } from '../swglobal/contract-load';

const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
});

const { handle } = require('../pstdao.ts');
let state = JSON.parse(fs.readFileSync('./src/pstdao.json', 'utf8'));

let { handler, swGlobal } = createContractExecutionEnvironment(arweave, handle.toString(), 'bYz5YKzHH97983nS8UWtqjrlhBHekyy-kvHt_eBxBBY');

const addresses = {
  admin: 'uhE-QeYS8i4pmUtnxQyHD7dzXFNaJ9oMK-IM-QPNY6M',
  user: 'VAg65x9jNSfO9KQHdd3tfx1vQa8qyCyJ_uj7QcxNLDk',
  nonuser: 'DiFv0MDBxKEFkJEy_KNgJXNG6mxxSTcxgV0h4gzAgsc'
};

describe('Transfer Balances', () => {
  const func = 'transfer';

  it(`should transfer from ${addresses.admin} to ${addresses.user}`, () => {
    handler(state, {input: {
      function: func,
      target: addresses.user,
      qty: 1000
    }, caller: addresses.admin});
  
    expect(Object.keys(state.balances).length).toBe(2);
    expect(state.balances[addresses.admin]).toBe(9999000);
    expect(state.balances[addresses.user]).toBe(1000);
  });

  it('should fail, invalid address', () => {
    try {
      handler(state, {input: {
        function: func,
        target: addresses.user,
        qty: 100
      }, caller: addresses.nonuser});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.balances[addresses.user]).toBe(1000);
    expect(state.balances[addresses.nonuser]).toBeUndefined();
  });

  it('should fail with not enough balance', () => {
    try {
      handler(state, {input: {
        function: func,
        target: addresses.nonuser,
        qty: 1100
      }, caller: addresses.user})
    } catch(err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.balances[addresses.user]).toBe(1000);
    expect(state.balances[addresses.nonuser]).toBeUndefined();
  });

  it('should fail with same target and caller', () => {
    try {
      handler(state, {input: {
        function: func,
        target: addresses.user,
        qty: 1000
      }, caller: addresses.user});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.balances[addresses.user]).toBe(1000);
  });

  it(`should transfer from ${addresses.user} to ${addresses.admin}`, () => {
    handler(state, {input: {
      function: 'transfer',
      target: addresses.admin,
      qty: 900
    }, caller: addresses.user});

    expect(state.balances[addresses.user]).toBe(100);
    expect(state.balances[addresses.admin]).toBe(9999900);
  });
});

describe('Get account balances', () => {
  const func = 'balance';

  it(`should get the balance for ${addresses.admin}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.admin
    }, caller: addresses.admin});

    expect(res.result.target).toBe(addresses.admin);
    expect(res.result.balance).toBe(9999900);
  });

  it(`should get the balance for ${addresses.admin}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.admin
    }, caller: addresses[3]});

    expect(res.result.target).toBe(addresses.admin);
    expect(res.result.balance).toBe(9999900);
  });

  it(`should get the balance for ${addresses.user}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.user
    }, caller: addresses.admin});

    expect(res.result.target).toBe(addresses.user);
    expect(res.result.balance).toBe(100);
  });

  it(`should get an error, account doesn't exists.`, async () => {
    try {
      const res = await handler(state, {input: {
        function: func,
        target: addresses[3]
      }, caller: addresses.admin});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }
    
    expect(state.balances[addresses[3]]).toBeUndefined();
  });
});

// Had to update SmartWeave to have a custom nonce for these tests.
describe('Locking system', () => {
  let bal = 100;
  it(`should not lock ${bal} from ${addresses.admin}`, () => {
    try {
      handler(state, {input: {
        function: 'lock',
        qty: bal,
        lockLength: 1
      }, caller: addresses.admin});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.lockedBalances[addresses.admin].length).toBe(1);
  });

  it(`should lock ${bal} from ${addresses.admin}`, () => {
    const prevBal = state.balances[addresses.admin];
    handler(state, {input: {
      function: 'lock',
      qty: bal,
      lockLength: 5
    }, caller: addresses.admin});

    expect(state.lockedBalances[addresses.admin].length).toBe(2);
    expect(state.lockedBalances[addresses.admin][1]).toEqual({
      balance: bal,
      lockLength: 5,
      start: 0
    });
    expect(state.balances[addresses.admin]).toBe((prevBal - bal));
  });

  it('should not allow unlock', () => {
    handler(state, {input: {function: 'unlock'}, caller: addresses.admin});
    expect(state.lockedBalances[addresses.admin].length).toBe(2);
  });

  it('should not allow unlock', () => {
    swGlobal.block.increment();
    try {
      handler(state, {input: {function: 'unlock'}, caller: addresses.admin});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }
    expect(state.lockedBalances[addresses.admin].length).toBe(2);
  });

  it('should allow unlock', () => {
    const prevBal = state.balances[addresses.admin];

    for(let i = 0; i < 4; i++) {
      swGlobal.block.increment();
    }
    handler(state, {input: {function: 'unlock'}, caller: addresses.admin});
    expect(state.lockedBalances[addresses.admin].length).toBe(1);
    expect(state.balances[addresses.admin]).toBe((prevBal + bal));
  });

  it('should allow a lock without giving a target', () => {
    handler(state, {input: {
      function: 'lock',
      qty: bal,
      lockLength: 5
    }, caller: addresses.admin});
  });

  it('should not allow unlock', () => {
    handler(state, {input: {function: 'unlock'}, caller: addresses.admin});
    expect(state.lockedBalances[addresses.admin].length).toBe(2);
  });

  it('should allow 1 unlock', () => {
    for(let i = 0; i < 5; i++) {
      swGlobal.block.increment();
    }
    handler(state, {input: {function: 'unlock'}, caller: addresses.admin});
    expect(state.lockedBalances[addresses.admin].length).toBe(1);
  });

  it('should return the account balances', async () => {
    const resultObj = {
      target: addresses.admin,
      balance: 1000
    };

    const res1 = await handler(state, {input: {function: 'lockedBalance'}, caller: addresses.admin});
    const res2 = await handler(state, {input: {function: 'lockedBalance', target: addresses.user}, caller: addresses.admin});
    expect(res1.result).toEqual({
      target: addresses.admin,
      balance: 1000
    });

    expect(res2.result).toEqual({
      target: addresses.user,
      balance: 0
    });
  });
});

