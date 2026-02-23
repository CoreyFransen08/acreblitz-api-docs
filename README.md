# AcreBlitz API Documentation

API documentation for the AcreBlitz ESA Check API, built with [Mintlify](https://mintlify.com).

## What's Documented

- **ESA Check API** — Check ESA/PULA restrictions for pesticide applications
- **Report Endpoints** — Download Enlist and Runoff compliance reports programmatically
- **Authentication** — API key setup and security best practices
- **White-Labeled Portal** — How the mitigation portal works for end users

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview locally:

```bash
npm i -g mintlify
```

Run the dev server from the `acreblitz-api-docs/` directory:

```bash
npx mintlify dev
```

View your local preview at `http://localhost:3000`.

## Publishing

Changes pushed to the default branch are automatically deployed via the Mintlify GitHub app. Install it from your [Mintlify dashboard](https://dashboard.mintlify.com/settings/organization/github-app).

## Troubleshooting

- Dev server not starting: Run `npx mintlify update` to ensure you have the latest CLI
- Page loads as 404: Make sure you're running from a folder with a valid `docs.json`
