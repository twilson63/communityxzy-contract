import { WarpFactory, defaultCacheOptions } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))
// @ts-ignore
const warp = WarpFactory.custom(arweave, { ...defaultCacheOptions, inMemory: true }, 'mainnet')
  .useArweaveGateway().build()

const VOUCH = '_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk'

async function main() {
  const result = await warp.contract(VOUCH)
    .connect(wallet)
    .writeInteraction({ function: 'patch' })
  console.log(result)
}

main()