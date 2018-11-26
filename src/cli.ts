import minimist from 'minimist'
import { processTestResults } from './processTestResults'
import { writeFileSync } from 'fs'
import { logger } from './logger'

const args = minimist(process.argv.slice(2), {
  string: ['project', 'category', 'output', 'commit', 'branch'],
})

async function main() {
  logger.info('Processing test results...')
  const getArg = (name: string) => {
    if (args[name] == null) {
      throw new Error(`Required command line argument: --${name}`)
    }
    return String(args[name])
  }
  const result = await processTestResults({
    testResultsDirs: args._,
    project: getArg('project'),
    category: getArg('category'),
    buildNumber: +getArg('buildNumber'),
    commit: getArg('commit'),
    branch: getArg('branch'),
  })
  const outputPath = getArg('output')
  logger.info('Saving processing results to', outputPath)
  const outputData = [] as any[]
  const stats = { docsCount: {} as { [indexName: string]: number } }
  for (const indexName of Object.keys(result.index)) {
    const docs = result.index[indexName]
    const docIds = Object.keys(docs)
    stats.docsCount[indexName] = docIds.length
    for (const docId of docIds) {
      outputData.push(
        { index: { _index: indexName, _id: docId, _type: '_doc' } },
        docs[docId]
      )
    }
  }
  writeFileSync(
    outputPath,
    outputData.map(row => JSON.stringify(row) + '\n').join(''),
    'utf8'
  )
  logger.info({ outputPath, stats }, 'Operation completed successfully')
}

process.on('unhandledRejection', e => {
  throw e
})

main().catch(e => {
  logger.error(e)
  process.exitCode = 1
})
