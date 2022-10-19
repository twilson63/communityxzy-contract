const { WarpFactory, LoggerFactory, defaultCacheOptions } = require('warp-contracts')
const fs = require('fs')

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')

LoggerFactory.INST.logLevel('error')
const warp = WarpFactory.forMainnet()
const CONTRACT = 'HW1vt0VSxPMxqQIaPGGqCsOBSTPflPFKhNiRTb2b1SE'

async function main() {
  const contract = warp.contract(CONTRACT).connect(wallet)

  const srcTxId = await contract.save({ src, useBundlr: false })
  console.log('new source', srcTxId)

  const evolveResult = await contract.evolve(srcTxId)

  console.log('evolveResult: ', evolveResult)
}

main()


