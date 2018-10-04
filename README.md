# test-indexer

A simple script to index Allure XML test results to Elasticsearch. This allows
us to analyze our test results across multiple projects and builds.

## Problem to solve

Some of our tests are flaky, and we mostly dealt with it by rebuilding and hope
that it will pass. Because of this, our automated tests which should make us
faster makes us slower instead. When multiple tests are flaky and/or slow, it
quickly becomes frustrating (e.g. today I fix this flaky test, the next day
another test fails). It’s hard to know which action to take that will make the
most impact.

The first step towards resolving this is to **gain visibility into our testing
process**, so that we can answer **key questions** like:

- Which flaky tests should we fix to have the most positive impact on build
  success rate?
- Which test should we optimize to have the most impact on reducing our build
  time?

## The indexing process

1. When tests are run, a results file is generated (Allure XML files).

2. We use [allure-commandline](https://www.npmjs.com/package/allure-commandline)
   to generate an HTML report. Inside the generated HTML reports are JSON files.

3. We read these JSON files (which represents each test case) and index them
   into Elasticsearch.

## Running the tool

Required environment variable: `TEST_INDEXER_SETTINGS`. This variable contains
the information necessary to connect to our Elasticsearch cluster. Basically
it’s Base64-encoded JSON-encoded object that looks like this:

```json
{
  "endpoint": "https://domain.region.es.amazonaws.com/",
  "accessKeyID": "AWSACCESSKEYIDHERE99",
  "secretAccessKey": "WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
}
```

To run:

```sh
npx @taskworld.com/tw-test-indexer \
  --project=tw-test-indexer \
  --category=unit-tests \
  --branch="$(git rev-parse --abbrev-ref HEAD)" \
  --commit="$(git rev-parse HEAD)" \
  --buildNumber="$CIRCLE_BUILD_NUM" \
  [--save="/tmp/result.json"]
  [--index]
  path/to/results/directory ...
```

- `--save` Saves the result to index into a JSON file. Useful for inspecting the
  output.
- `--index` Performs the actual index to Elasticsearch.

## Setting up an index

```
PUT /testcases
{
  "mappings": {
    "_doc": {
      "properties": {
        "uid": {"type": "keyword"},
        "name": {"type": "text"},
        "status": {"type": "keyword"},
        "project": {"type": "keyword"},
        "branch": {"type": "keyword"},
        "commit": {"type": "keyword"},
        "category": {"type": "keyword"},
        "buildNumber": {"type": "integer"},
        "time": {
          "properties": {
            "start": {"type": "date"},
            "stop": {"type": "date"},
            "duration": {"type": "integer"}
          }
        }
      }
    }
  }
}
```
