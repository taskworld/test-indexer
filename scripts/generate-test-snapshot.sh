#!/bin/bash
./cli.js \
  --project=allure-demo \
  --category=example \
  --branch=master \
  --commit=96a6408f1ab1884667881488be5e266481de0d98 \
  --buildNumber=1 \
  --output=./test/allure-demo.ndjson \
  vendor/allure-demo/allure-results
