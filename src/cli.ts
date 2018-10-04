import minimist from 'minimist'
import { processTestResults } from './processTestResults'
import { checkEnv } from './environment'
import { writeFileSync } from 'fs'
import Elasticsearch from 'elasticsearch'
import AWS from 'aws-sdk'
import { logger } from './logger'

const args = minimist(process.argv.slice(2), {
  boolean: ['index'],
  string: ['save'],
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
  if (args.save) {
    logger.info('Saving processing results to', args.save)
    writeFileSync(args.save, JSON.stringify(result, null, 2))
  }
  if (args.index) {
    logger.info('Going to index the result...')
    const env = await checkEnv()
    const region = env.endpoint.match(/([^.]+)\.es\.amazonaws\.com/)![1]
    AWS.config.update({
      credentials: new AWS.Credentials(env.accessKeyID, env.secretAccessKey),
      region: region,
    })
    const es = new Elasticsearch.Client({
      hosts: [env.endpoint],
      connectionClass: require('http-aws-es'),
    })
    for (const indexName of Object.keys(result.index)) {
      const docs = result.index[indexName]
      const docIds = Object.keys(docs)
      const chunkSize = 100
      for (let i = 0; i < docIds.length; i += chunkSize) {
        const docIdsThisChunk = docIds.slice(i, i + chunkSize)
        logger.info(
          { indexName },
          'Indexing %d docs (%d/%d)',
          docIdsThisChunk.length,
          i + docIdsThisChunk.length,
          docIds.length
        )
        const body: any[] = []
        for (const docId of docIdsThisChunk) {
          body.push(
            { index: { _index: indexName, _id: docId, _type: '_doc' } },
            docs[docId]
          )
        }
        await es.bulk({ body })
      }
    }
  }
  logger.info('* Operation completed successfully')
}

process.on('unhandledRejection', e => {
  throw e
})

main()
