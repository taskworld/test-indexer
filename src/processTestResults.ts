import { execFileSync } from 'child_process'

export type ProcessOptions = {
  testResultsDirs: string[]

  /** The unique name of the project being tested (e.g. tw-frontend) */
  project: string

  /** The test category (e.g. e2e, unit) */
  category: string

  /** The build number */
  buildNumber: number

  /** The commit ID */
  commit: string

  /** The git branch */
  branch: string
}

export async function processTestResults(options: ProcessOptions) {
  const allureCLI = require.resolve('allure-commandline/dist/bin/allure')
  if (!options.testResultsDirs.length) {
    throw new Error(
      'processTestResults(): You must specify test results directory!'
    )
  }
  execFileSync(allureCLI, ['generate', '--clean', ...options.testResultsDirs], {
    stdio: 'inherit',
  })
}
