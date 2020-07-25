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

describe('Transfer Balances', () => {
  it('Should successed', () => {
    handler(state, {input: {
      function: 'transfer',
      target: 'asdf',
      qty: 1000
    }, caller: 'uhE-QeYS8i4pmUtnxQyHD7dzXFNaJ9oMK-IM-QPNY6M'});
  
    expect(Object.keys(state.balances).length).toBe(2);
    expect(Object.values(state.balances)[0]).toBe(9999000);
    expect(Object.values(state.balances)[1]).toBe(1000);
  });

  it('Should fail, invalid address', () => {
    try {
      handler(state, {input: {
        function: 'transfer',
        target: 'asdf',
        qty: 100
      }, caller: 'ueyusj'});
    } catch (err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.balances['asdf']).toBe(1000);
    expect(state.balances['ueyusj']).toBeUndefined();
  });

  it('Should fail with not enough balance', () => {
    try {
      handler(state, {input: {
        function: 'transfer',
        target: 'ueyusj',
        qty: 1100
      }, caller: 'asdf'})
    } catch(err) {
      expect(err.name).toBe('ContractError');
    }

    expect(state.balances['asdf']).toBe(1000);
    expect(state.balances['ueyusj']).toBeUndefined();
  });
});