import minimist from 'minimist'
import { processTestResults } from './processTestResults'
import { checkEnv } from './environment'

const args = minimist(process.argv.slice(2), {
  boolean: ['process'],
})

async function main() {
  console.log('Processing test results...')
  const getArg = (name: string) => {
    if (args[name] == null) {
      throw new Error(`Required command line argument: --${name}`)
    }
    return String(args[name])
  }
  const dataToIndex = await processTestResults({
    testResultsDirs: args._,
    project: getArg('project'),
    category: getArg('category'),
    buildNumber: +getArg('buildNumber'),
    commit: getArg('commit'),
    branch: getArg('branch'),
  })
  console.log(dataToIndex)
  // const env = await checkEnv()
}

process.on('unhandledRejection', e => {
  throw e
})

main()
