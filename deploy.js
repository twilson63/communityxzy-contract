const { WarpFactory, LoggerFactory, defaultCacheOptions } = require('warp-contracts')
const fs = require('fs')
const Arweave = require('arweave')
// old vouch contract here
const VOUCH = 'HW1vt0VSxPMxqQIaPGGqCsOBSTPflPFKhNiRTb2b1SE'

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

LoggerFactory.INST.logLevel('error')
const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const warp = WarpFactory.custom(arweave, {
  ...defaultCacheOptions,
  inMemory: true
}, 'mainnet')
  .useArweaveGateway() // use arweave gateway 
  .build()

async function main() {
  let initState = await warp.contract(VOUCH).readState().then(res => res.cachedValue.state)

  initState = Object.assign({}, initState, { roles: { 'NlNd_PcajvxAkOweo7rZHJKiIJ7vW1WXt9vb6CzGmC0': 'admin' }, vouched: {} })

  console.log(initState)

  const src = fs.readFileSync('./dist/contract.js', 'utf-8')

  const result = await warp.createContract.deploy({
    src,
    wallet,
    initState: JSON.stringify(initState)
  })

  console.log(result)

}

main()