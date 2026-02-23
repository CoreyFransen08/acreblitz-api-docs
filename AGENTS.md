# AcreBlitz API Documentation — Project Instructions

## About this project

- This is the AcreBlitz ESA Check API documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Run `npx mintlify dev` to preview locally

## Terminology

- Use **ESA** (Endangered Species Act), not "endangered species"
- Use **PULA** (Pesticide Use Limitation Area), not "limitation area"
- Use **Bulletins Live! Two** on first reference, **BLT** after
- Use **portal** to refer to the white-labeled mitigation selection interface
- Use **mitigation** not "remediation" or "mitigation measure"
- Use **field boundary** not "polygon" or "geometry" in user-facing text
- Use **compliance report** not "PDF report" or "mitigation report"
- Use **application** to mean a pesticide application event
- Use **provider** to refer to the API integration partner (ag tech company)
- Use **applicator** or **grower** to refer to the end user

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for field names, endpoints, parameters, and code references
- Include request/response examples for all endpoints
- Always show cURL examples; optionally include TypeScript and Python

## Content boundaries

- Do not document internal admin features or database schema
- Do not expose internal field IDs or portal token formats
- Keep pricing references general ("per-check pricing") — do not include specific prices
- Do not document the legacy `/pula-check` endpoint; only reference `/esa-check`
