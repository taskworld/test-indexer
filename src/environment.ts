export type TestIndexerEnvironment = {
  accessKeyID: string
  secretAccessKey: string
  endpoint: string
}

export async function checkEnv(): Promise<TestIndexerEnvironment> {
  const settings = JSON.parse(
    Buffer.from(getEnv('TEST_INDEXER_SETTINGS'), 'base64').toString()
  )
  if (typeof settings.accessKeyID !== 'string') {
    throw new Error(`TEST_INDEXER_SETTINGS: accessKeyID should be a string`)
  }
  if (typeof settings.secretAccessKey !== 'string') {
    throw new Error(`TEST_INDEXER_SETTINGS: secretAccessKey should be a string`)
  }
  if (typeof settings.endpoint !== 'string') {
    throw new Error(`TEST_INDEXER_SETTINGS: endpoint should be a string`)
  }
  return settings
}

function getEnv(env: string) {
  if (!process.env[env]) throw new Error('Missing environment variable ' + env)
  return process.env[env]!
}
