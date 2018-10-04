import { execFileSync } from 'child_process'
import glob from 'glob'
import { readFileSync } from 'fs'

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

export type ProcessResult = {
  /** Data to be indexed to Elasticsearch */
  index: {
    [indexName: string]: {
      [docId: string]: any
    }
  }
}

export async function processTestResults(
  options: ProcessOptions
): Promise<ProcessResult> {
  const allureCLI = require.resolve('allure-commandline/dist/bin/allure')
  if (!options.testResultsDirs.length) {
    throw new Error(
      'processTestResults(): You must specify test results directory!'
    )
  }
  execFileSync(allureCLI, ['generate', '--clean', ...options.testResultsDirs], {
    stdio: 'inherit',
  })
  const testcases = glob.sync('allure-report/data/test-cases/*.json')
  const result: ProcessResult = {
    index: { testcases: {} },
  }
  const context = {
    project: options.project,
    branch: options.branch,
    commit: options.commit,
    category: options.category,
    buildNumber: options.buildNumber,
  }
  for (const filename of testcases) {
    try {
      const data = JSON.parse(readFileSync(filename, 'utf8'))
      if (!data.time.start) {
        throw new Error(
          'Missing timestamp in testcase data. ' +
            '(Note that JUnit XML files do not contain this information and thus cannot be used.)'
        )
      }
      const testcaseDoc = {
        ...data,
        ...context,
      }
      testcaseDoc.testStage = removeNestedSteps(testcaseDoc.testStage)
      testcaseDoc.beforeStages = testcaseDoc.beforeStages.map(removeNestedSteps)
      testcaseDoc.afterStages = testcaseDoc.beforeStages.map(removeNestedSteps)
      result.index.testcases[data.uid] = testcaseDoc
    } catch (e) {
      console.error(
        'processTestResults(): Cannot process test case file',
        filename,
        e
      )
    }
  }
  return result
}

function removeNestedSteps(stage: any) {
  if (!stage) return stage
  if (typeof stage !== 'object') return stage
  if (!Array.isArray(stage.steps)) return stage
  return {
    ...stage,
    steps: stage.steps.map((step: any) => {
      const s = { ...step }
      delete s.steps
      return s
    }),
  }
}
