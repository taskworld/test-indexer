export async function processTestResults(testResults: string[]) {
  const allureCLI = require.resolve('allure-commandline/dist/bin/allure')
  if (!testResults.length) {
    throw new Error(
      'processTestResults(): You must specify test results directory!'
    )
  }
  console.log(allureCLI)
}
