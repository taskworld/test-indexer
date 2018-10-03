import minimist from 'minimist'
import { processTestResults } from './processTestResults'
import { checkEnv } from './environment'

const args = minimist(process.argv.slice(2), {
  boolean: ['process']
})

async function main() {
  if (args.process) {
    console.log('Processing test results...')
    const env = checkEnv()
    await processTestResults(args._)
    return
  }
  throw new Error('What do you want to do?')
}

process.on('unhandledRejection', e => {
  throw e
})

main()
