import { WarpFactory, defaultCacheOptions } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))
// @ts-ignore
const warp = WarpFactory.custom(arweave, { ...defaultCacheOptions, inMemory: true }, 'mainnet')
  .useArweaveGateway().build()

const TEST_VOUCH = 'HLwOKJeZ3ABm08bZW4fMwOCmPN-SwmgvnOKFqv8cw8U'
const SRC = fs.readFileSync('./dist/contract.js', 'utf-8')

async function main() {

  // Deploy Script Steps
  // Save Contract Source
  const SRC_TX = '1hDZBRSptTNgnACuO9qGHLbaOfnAcMBKCHcHPRhMWUY'
  //const tx = await warp.createSourceTx({ src: SRC }, wallet)
  //const result = await warp.saveSourceTx(tx,  true)

  // 1. Evolve contract
  // const result = await warp.contract(TEST_VOUCH)
  //   .connect(wallet)
  //   .evolve(SRC_TX, { disableBundling: true })

  // 2. Run Patch
  // const result = await warp.contract(TEST_VOUCH)
  //   .connect(wallet)
  //   .writeInteration({
  //     function: 'patch'
  //   })
  // 3. Verify addVouchUser method
  console.log(result)
}

main()