# exquisite corpse club

We use SvelteKit, AWS Lambda, API Gateway, DynamoDB, and Cognito. This repo is a full-stack serverless app built with [SST](https://github.com/sst/sst).

- The `stacks/` directory defines our AWS infrastructure using AWS CDK.
- The `packages/functions` directory contains the Lambda functions that power the CRUD API.
- The `packages/frontend` directory contains the SvelteKit app.
