# exquisite corpse club

We use SvelteKit, AWS Lambda, API Gateway, DynamoDB, and Cognito. This repo is a full-stack serverless app built with [SST](https://github.com/sst/sst).

- The `stacks/` directory defines our AWS infrastructure using AWS CDK.
- The `packages/functions` directory contains the Lambda functions that power the CRUD API.
- The `packages/frontend` directory contains the SvelteKit app.

## The Plan™

0. Auth (Anon)
   - Every visitor is "signed in" as guest user with random username
   - If you want to sign in to account from different env you can "upgrade" to an auth provider account
1. Homepage
   - Rotating corpses/sections
   - "Draw corpse" button
   - "Gallery" button
   - "About" or similar button
   - Customizable homepage with pinned favorites, theme picker, etc.
2. Draw flow:
   - Select a section type (or pick "random")
   - Draw on 3:1 `<canvas>` via `canvas-paint`
   - Toggle to show hints of other sections
3. Submit flow:
   - Assigned random section name
   - Assigned random artist name
   - Shuffle your names
   - Section is saved to S3 as PNG (0.5x, 1x, 2x) and WebM (max 10s)
   - Corpse is saved to S3 as PNG (0.5x, 1x, 2x) and WebM (max 10s)
4. Gallery flow:
   - Toggle corpse/section view
   - Filter by section type
   - Sort by date/likes
5. View corpse/section flow:
   - Like
   - Pin
