#!/usr/bin/env node
// Generate both-version agent exports; verify source coverage and unauthenticated HTTP reads.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'docs.json'), 'utf8'));
const origin = 'https://docs.acreblitz.com';
function pages(node) {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(pages);
  return Object.entries(node ?? {}).filter(([k]) => ['tabs','groups','pages'].includes(k)).flatMap(([,v]) => pages(v));
}
function frontmatter(text, key) {
  return text.match(new RegExp(`^${key}:\\s*["']?([^\\n]*?)["']?\\s*$`, 'm'))?.[1] ?? '';
}
async function expand(text) {
  for (const [tag, file] of text.matchAll(/<Snippet\s+file="([^"]+)"\s*\/>/g)) {
    const snippet = await readFile(path.join(root, 'snippets', file), 'utf8');
    text = text.replace(tag, await expand(snippet));
  }
  const imports = [...text.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm)];
  for (const [, name, file] of imports) {
    const snippet = await readFile(path.join(root, file.replace(/^\//, '')), 'utf8');
    text = text.replace(new RegExp(`<${name}\\s*/>`, 'g'), await expand(snippet));
  }
  return text.replace(/^import\s+.*$/gm, '');
}
function markdown(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/<ParamField\b([^>]*)>([\s\S]*?)<\/ParamField>/g, (_, attrs, body) => {
      const match = attrs.match(/(body|path|query|header)="([^"]+)"/);
      const type = attrs.match(/type="([^"]+)"/)?.[1];
      const def = attrs.match(/default="([^"]+)"/)?.[1];
      return `\n### ${match?.[2] ?? 'Parameter'}\n\n${match?.[1] ?? ''} parameter; ${type ?? ''}; ${/\brequired\b/.test(attrs) ? 'required' : 'optional'}${def ? `; default: ${def}` : ''}.\n\n${body.trim()}\n`;
    })
    .replace(/<Card\b([^>]*)>([\s\S]*?)<\/Card>/g, (_, attrs, body) => `\n- [${attrs.match(/title="([^"]+)"/)?.[1] ?? 'Read more'}](${attrs.match(/href="([^"]+)"/)?.[1] ?? ''}): ${body.trim()}\n`)
    .replace(/<\/?(?:RequestExample|ResponseExample|CardGroup|Note|Warning|Tip|Info)(?:\s[^>]*)?>/g, '')
    .replace(/\]\(\/(?!\/)/g, `](${origin}/`)
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n').trim();
}
const entries=[];
for (const version of config.navigation.versions) {
  for (const slug of pages(version)) {
    const source=await readFile(path.join(root, `${slug}.mdx`), 'utf8');
    entries.push({ version:version.version, slug, title:frontmatter(source,'title'), description:frontmatter(source,'description'), api:frontmatter(source,'api'), source, content:markdown(await expand(source)) });
  }
}
const intro='# AcreBlitz API\n\n> ESA and PULA API documentation for V1 and V2.\n\nV1 uses https://esa.acreblitz.com/api/v1. V2 uses https://esa-v2.acreblitz.com/api/v2. Keep versions separate when answering or building requests. V1 is the website default; this index explicitly includes both versions. Fetch the linked Markdown pages directly; no API key or user copy/paste is needed to read the public documentation.\n';
let index=intro;
for (const version of config.navigation.versions) {
  index+=`\n## ${version.version}\n\n`;
  index+=entries.filter(e=>e.version===version.version).map(e=>`- [${e.title}](${origin}/${e.slug}.md): ${e.description}`).join('\n')+'\n';
}
index+='\n## Complete content\n\n- [All V1 and V2 documentation](https://docs.acreblitz.com/llms-full.txt): Full page text, parameters, and request/response examples. Large file; prefer individual pages for focused questions.\n';
const full=intro+'\n'+entries.map(e=>`# ${e.version}: ${e.title}\n\nSource: ${origin}/${e.slug}.md\n\n> ${e.description}\n${e.api ? `\nEndpoint: \`${e.api}\`\n` : ''}\n${e.content}\n`).join('\n---\n\n');
const args=process.argv.slice(2);
for (const [file, value] of [['llms.txt',index],['llms-full.txt',full]]) {
  if (args.includes('--write')) await writeFile(path.join(root,file),value);
  else if (await readFile(path.join(root,file),'utf8')!==value) throw new Error(`${file} is stale. Run node scripts/agent-docs.mjs --write`);
}
if (/<Snippet\b|<ApplicationInputs\s*\/>|^import\s/m.test(full)) throw new Error('Agent export contains unresolved snippet imports');
console.log(`Agent exports cover ${entries.length} pages (${entries.filter(e=>e.version==='V2').length} V2), with snippets expanded.`);
const baseIndex=args.indexOf('--base-url');
if (baseIndex !== -1) {
  const base=new URL(args[baseIndex+1]);
  if(!['http:','https:'].includes(base.protocol)) throw new Error('Use an http(s) docs URL');
  const selected=args.includes('--v1-only') ? entries.filter(e=>e.version==='V1') : entries;
  const htmlOnly=args.includes('--html-only');
  let failed=0;
  async function check(url, expected, kind) {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'AcreBlitz-Docs-Readability-Check/1.0'}});
      const body=await response.text();
      const readable=kind==='html' ? body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#x27;|&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&') : body;
      const missing=expected.filter(s=>!readable.includes(s));
      if(!response.ok || missing.length || (kind!=='html' && /<!doctype html|<html[\s>]/i.test(body))) throw new Error(`HTTP ${response.status}; missing ${missing.join(', ') || 'none'}; ${response.headers.get('content-type')}`);
      console.log(`PASS ${url.pathname} (${body.length} chars)`);
    } catch(error) { failed++; console.error(`FAIL ${url.pathname}: ${error.message}`); }
  }
  for (const entry of selected) {
    const route=entry.slug==='index' ? '/' : '/'+entry.slug.replace(/\/index$/,'');
    const expected=[entry.title];
    if(entry.api) expected.push('curl','X-API-Key');
    if(entry.slug==='v2/api-reference/endpoint/esa-check') expected.push('provider_id','product_name','application_method','rate_unit');
    if(entry.slug==='v2/api-reference/endpoint/bulk-submit') expected.push('Where each value belongs','Pest precedence','provider_group_id','Duplicate application_id');
    await check(new URL(route,base), expected,'html');
    if(!htmlOnly) await check(new URL('/'+entry.slug+'.md',base),expected,'markdown');
  }
  await check(new URL('/llms.txt',base), selected.map(e=>'/'+e.slug+'.md'),'index');
  await check(new URL('/llms-full.txt',base), selected.map(e=>e.title),'markdown');
  if(failed) process.exitCode=1;
  else console.log(`All requested HTTP reads passed without credentials or browser JavaScript.`);
}
