import * as fs from 'fs';
import * as path from 'path';
import  Arweave from 'arweave/node';
import { createContractExecutionEnvironment } from '../swglobal/contract-load';

const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
});

const pstFile = path.resolve(__dirname, '../../dist/pstdao.js');
let state = JSON.parse(fs.readFileSync('./src/pstdao.json', 'utf8'));

let { handler, swGlobal } = createContractExecutionEnvironment(arweave, fs.readFileSync(pstFile, 'utf8'), '');

const addresses = {
  admin: 'uhE-QeYS8i4pmUtnxQyHD7dzXFNaJ9oMK-IM-QPNY6M',
  user: 'VAg65x9jNSfO9KQHdd3tfx1vQa8qyCyJ_uj7QcxNLDk',
  nonuser: 'DiFv0MDBxKEFkJEy_KNgJXNG6mxxSTcxgV0h4gzAgsc'
};

describe('Transfer Balances', () => {
  const func = 'transfer';

  it(`Should transfer from ${addresses.admin} to ${addresses.user}`, () => {
    handler(state, {input: {
      function: func,
      target: addresses.user,
      qty: 1000
    }, caller: addresses.admin});
  
    expect(Object.keys(state.balances).length).toBe(2);
    expect(state.balances[addresses.admin]).toBe(9999000);
    expect(state.balances[addresses.user]).toBe(1000);
  });

  it('Should fail, invalid address', () => {
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

  it('Should fail with not enough balance', () => {
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

  it('Should fail with same target and caller', () => {
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

  it(`Should transfer from ${addresses.user} to ${addresses.admin}`, () => {
    handler(state, {input: {
      function: 'transfer',
      target: addresses.admin,
      qty: 1000
    }, caller: addresses.user});

    expect(state.balances[addresses.user]).toBe(0);
    expect(state.balances[addresses.admin]).toBe(10000000);
  });
});

describe('Get account balances', () => {
  const func = 'balance';

  it(`Should get the balance for ${addresses.admin}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.admin
    }, caller: addresses.admin});

    expect(res.result.target).toBe(addresses.admin);
    expect(res.result.balance).toBe(10000000);
  });

  it(`Should get the balance for ${addresses.admin}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.admin
    }, caller: addresses[3]});

    expect(res.result.target).toBe(addresses.admin);
    expect(res.result.balance).toBe(10000000);
  });

  it(`Should get the balance for ${addresses.user}`, async () => {
    const res = await handler(state, {input: {
      function: func,
      target: addresses.user
    }, caller: addresses.admin});

    expect(res.result.target).toBe(addresses.user);
    expect(res.result.balance).toBe(0);
  });

  it(`Should get an error, account doesn't exists.`, async () => {
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

// TODO: These ones don't work because of SmartWeave block height
describe('Locking system', () => {
  let bal = 100;
  it(`should lock ${100} from ${addresses.admin}`, () => {
    handler(state, {input: {
      function: 'lock',
      qty: bal,
      lockLength: 1
    }, caller: addresses.admin});

    console.log(state);
  });
});