# AcreBlitz API documentation

This is a separate Git repository for the Mintlify documentation site.

## API versions

`docs.json` uses Mintlify's native `navigation.versions` dropdown:

- **V1** is the default. Existing pages and public documentation URLs remain available. The global MDX server stays `https://esa.acreblitz.com`. The ESA-check page now includes an explicit cURL example for Markdown readers, and legacy examples omit internal field identifiers.
- **V2** lives under `v2/`, with guides and all 14 partner endpoints. Each V2 endpoint's `api` frontmatter includes the full `https://esa-v2.acreblitz.com/api/v2/...` URL so its playground does not inherit the V1 server.

The V2 bulk reference documents shared products/crops, per-field replacement, required group identifiers, idempotency, job polling, pagination, retention and per-item outcomes. The V2 guides cover authentication, migration, assessment interpretation, soil reuse and errors. Examples use placeholder provider identifiers and environment variables for API keys; never add real provider credentials to this public repository.

`snippets/v2-application-inputs.mdx` holds the shared single-check input documentation. Update it and the bulk reference when request schemas change.

## Agent access and validation

The public documentation host is `https://docs.acreblitz.com`. Agents can fetch HTML, append `.md` to a page URL, or use the hosted site's `Accept: text/markdown` support. No documentation login or API key is required. API calls still require a provider key.

Mintlify's automatic `llms.txt` and `llms-full.txt` cover the default version. This repo overrides both with generated files covering **both V1 and V2**. The full export expands snippets and retains endpoint URLs, parameters, examples, and errors. Do not edit those generated files manually.

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

Validation on 2026-09-30: all 29 local pages were readable without credentials or JavaScript; both generated exports cover all pages. Nine V2 JSON requests, bulk default/override/null/array/pest behavior, and five exact validation error examples were checked against the current application schemas. All 54 public HTTP/item/assessment code coverage checks passed. Express middleware checks confirmed JSON errors, body-size handling, retry headers, and plain-text 429s using local stub services with no database access. The worker-only lease-loss code is not a client error and is intentionally excluded.

Before this release, all eight public V1 pages and their Markdown URLs returned HTTP 200, while unpublished V2 URLs returned 404. The V1 ESA-check Markdown lacked an explicit cURL/auth example; this release adds it. The browsing search tool used for that review could not open the site's URLs, although direct unauthenticated HTTP fetches succeeded. Run the hosted check above after deployment to verify the current release.

## Local preview and validation

Use Node 22 LTS for the local preview; the Mintlify preview launcher rejects Node 25+. Ensure your Node runtime and installed CLI dependencies use the same CPU architecture (ARM64 on Apple silicon). Switch runtimes with your Node version manager, then run the installed CLI from this directory:

```bash
mintlify dev --port 3040
mintlify validate
mintlify broken-links
```

The current CLI is also distributed as `mint` and exposes the equivalent `mint dev`, `mint validate`, and `mint broken-links` commands.

The endpoint source is maintained in the application repository's `node_server/src/esa/api/app.ts`, request schemas, and workflow response builders. Check routes and schemas when updating the public documentation. Do not copy internal database/admin documentation into this repository.

## Publishing

Review and commit these changes in **this repository**. Changes pushed to its default branch deploy through the existing Mintlify GitHub integration. Committing the parent AcreBlitz application repository does not publish this site's changes. Coordinate publishing V2 documentation with V2 service/domain readiness. Keep V1 available in the dropdown.
