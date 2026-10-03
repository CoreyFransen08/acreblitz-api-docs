# AcreBlitz API documentation

This is a separate Git repository for the Mintlify documentation site.

## API version and host

The documentation covers V2, the default and only version in `docs.json`. V1 endpoint pages have been removed. The root landing page directs readers to the supported API documentation under `v2/`.

All 16 endpoint pages and their examples use `https://esa.acreblitz.com/api/v2/...`. The global MDX server is `https://esa.acreblitz.com`. Keep the `/api/v2` route prefix when changing hosts.

The V2 bulk reference documents shared products/crops, per-field replacement, required group identifiers, idempotency, job polling, pagination, retention and per-item outcomes. The V2 guides cover authentication, migration, assessment interpretation, soil reuse and errors. Examples use placeholder provider identifiers and environment variables for API keys; never add real provider credentials to this public repository.

Single-check inputs live directly in `v2/api-reference/endpoint/esa-check.mdx` so the hosted Markdown export contains every parameter. Update that page and the bulk reference when request schemas change.

## Agent access and validation

The public documentation host is `https://docs.acreblitz.com`. Agents can fetch HTML, append `.md` to a page URL, or use the hosted site's `Accept: text/markdown` support. No documentation login or API key is required. API calls still require a provider key.

This repo maintains generated `llms.txt` and `llms-full.txt` files covering every supported V2 endpoint and guide. The full export expands snippets and retains endpoint URLs, parameters, examples, and errors. The index links to the full export with a content-hash query parameter to avoid stale CDN copies after publication. Do not edit those generated files manually.

After editing pages or navigation, regenerate and check the exports:

```bash
node scripts/agent-docs.mjs --write
node scripts/agent-docs.mjs
```

With the local preview running, verify every page's server-rendered text and both discovery files without browser JavaScript:

```bash
node scripts/agent-docs.mjs --base-url http://localhost:3041 --html-only
```

Use the actual preview port printed by the CLI. The installed local preview does not implement hosted `.md` routes (they return 404); `--html-only` skips those routes, while still checking the custom text exports. After publishing, require the complete hosted check, including every individual Markdown URL:

```bash
node scripts/agent-docs.mjs --base-url https://docs.acreblitz.com
```

The check rejects HTTP errors, HTML masquerading as Markdown, missing page titles, missing endpoint cURL/auth examples, missing bulk guidance, and unresolved V2 inputs. A successful local check does not prove the unpublished hosted V2 URLs are available. An agent still needs a working network-fetch tool; site accessibility cannot guarantee access through every AI product's browsing proxy.

## Local preview and validation

Use Node 22 LTS for the local preview; the Mintlify preview launcher rejects Node 25+. Ensure your Node runtime and installed CLI dependencies use the same CPU architecture (ARM64 on Apple silicon). Switch runtimes with your Node version manager, then run the installed CLI from this directory:

```bash
mintlify dev --port 3040
mintlify validate
mintlify broken-links
```

The current CLI is also distributed as `mint` and exposes the equivalent `mint dev`, `mint validate`, and `mint broken-links` commands.

The endpoint source is maintained in the application repository's `platform/apps/api/src/esa/api/app.ts`, request schemas, and workflow response builders. Check routes and schemas when updating the public documentation. Do not copy internal database/admin documentation into this repository.

## Publishing

Review and commit these changes in **this repository**. Changes pushed to its default branch deploy through the existing Mintlify GitHub integration. Committing the parent AcreBlitz application repository does not publish this site's changes. Coordinate publishing with service readiness at `https://esa.acreblitz.com`. The API route prefix remains `/api/v2`.
