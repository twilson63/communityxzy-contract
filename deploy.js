const { WarpFactory, LoggerFactory, defaultCacheOptions } = require('warp-contracts')
const fs = require('fs')
const Arweave = require('arweave')
// old vouch contract here
const VOUCH = 'ZGaL5DOMIYRw9YHZ_NZ2JoIjST1QwhiD6T1jePH381I'

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
  const initState = warp.contract(VOUCH).readState().then(res => res.cachedValue.state)
  console.log(initState)
  // TODO: Change old Wallet Address with new Wallet Address
  const src = fs.readFileSync('./dist/contract.js', 'utf-8')

  const result = await warp.createContract.deploy({
    src,
    wallet,
    initState: JSON.stringify(initState)
  })

  console.log(result)

}

main()