// create a copy of current vouchdao contract 
import { WarpFactory, defaultCacheOptions } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))
// @ts-ignore
const warp = WarpFactory.custom(arweave, { ...defaultCacheOptions, inMemory: true }, 'mainnet')
  .useArweaveGateway().build()

async function main() {
  // @ts-ignore
  const vouchState = await fetch('https://cache.permapages.app/_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk').then(res => res.json())
  const initState = {
    name: 'TestVouchDAOPatch',
    ticker: 'TEST_VOUCH_DAO_2',
    balances: {
      'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI': 0
    },
    roles: {
      'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI': 'admin'
    },
    settings: vouchState.settings,
    vault: {
      'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI': [{
        balance: 10000000,
        end: 992169,
        start: 991449
      }]
    },
    votes: [
      {
        key: "Voucher",
        nays: 0,
        note: "Verifying Tom's twitter verification address",
        start: 991453,
        status: "passed",
        totalWeight: 7200000000,
        type: "set",
        value: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
        voted: [
          "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"
        ],
        yays: 7200000000
      }
    ],
    // convert to arrays
    vouched: Object.keys(vouchState.vouched).reduce((a, k) => {
      a[k] = [vouchState.vouched[k]]
      return a
    }, {}),
    canEvolve: true
  }
  //console.log(JSON.stringify(initState, null, 2))
  /*
  const result = await warp.createContract.deployFromSourceTx({
    wallet,
    initState: JSON.stringify(initState),
    srcTxId: 'ovWCp0xKuHtq-bADXbtiNr6umwb_AE73kVZWtfHlX3w'
  })
  console.log(result)
  */
}

main()
