/**
 * Checks data/vendors.js against the contract in CONTRIBUTING.md.
 *
 *   node tools/validate.mjs            shape only
 *   node tools/validate.mjs --links    also check every source URL resolves
 *
 * This enforces the mechanical rules. Whether a brand sits in the right
 * difficulty band is a judgement call for review — see the rubric.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath, URL} from 'node:url';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(fileURLToPath(new URL(rel, root)), 'utf8');

/* Tier ids are defined once, in the app. Read them from there so this file
   cannot drift out of step with what the site actually renders. */
const appSource = read('assets/app.js');
const tierBlock = appSource.match(/var TIERS = \[([\s\S]*?)\];/);
if (!tierBlock) {
  console.error('validate: could not find the TIERS array in assets/app.js');
  process.exit(2);
}
const TIERS = [...tierBlock[1].matchAll(/\{id: '([a-z]+)'/g)].map((m) => m[1]);

/* data/vendors.js assigns to a global, so give it one. */
globalThis.window = {};
await import(new URL('../data/vendors.js', import.meta.url));
const vendors = globalThis.window.WALL_DATA.vendors;

const KINDS = ['official', 'news', 'reference'];
const problems = [];
const seen = new Set();

const fail = (who, msg) => problems.push(`${who}: ${msg}`);

for (const [i, v] of vendors.entries()) {
  const who = v && v.name ? v.name : `entry #${i + 1}`;

  if (!v.name || typeof v.name !== 'string') fail(who, 'missing name');
  if (seen.has(v.name)) fail(who, 'duplicate name');
  seen.add(v.name);

  if (!TIERS.includes(v.tier)) {
    fail(who, `tier "${v.tier}" is not one of: ${TIERS.join(', ')}`);
  }

  if (!v.verdict || !/[.!?]$/.test(v.verdict.trim())) {
    fail(who, 'verdict must be a complete sentence ending in punctuation');
  } else if (v.verdict.length > 95) {
    fail(who, `verdict is ${v.verdict.length} chars; keep it under 95 so it fits the card`);
  }

  if (!v.detail || v.detail.length < 60) {
    fail(who, 'detail must explain the mechanism (60 chars minimum)');
  }

  if (!Array.isArray(v.evidence) || v.evidence.length < 2 || v.evidence.length > 4) {
    fail(who, 'evidence must be 2 to 4 fragments');
  } else {
    /* Casing is not checked: distinguishing a proper noun from a stray capital
       needs judgement no allowlist survives ("Ubuntu Touch", "One UI", "ROG
       Phone"). It is a review checklist item instead. */
    for (const e of v.evidence) {
      if (e.length > 32) fail(who, `evidence "${e}" is too long for a chip (32 chars max)`);
    }
  }

  if (v.source) {
    const s = v.source;
    if (!/^https:\/\/\S+$/.test(s.url || '')) fail(who, 'source.url must be an https URL');
    if (!s.label) fail(who, 'source.label must name the source');
    if (!KINDS.includes(s.kind)) fail(who, `source.kind must be one of: ${KINDS.join(', ')}`);
  }
}

/* Optional network pass. */
if (process.argv.includes('--links')) {
  const withSource = vendors.filter((v) => v.source);
  console.log(`checking ${withSource.length} source URLs…`);
  await Promise.all(withSource.map(async (v) => {
    try {
      const res = await fetch(v.source.url, {
        redirect: 'follow',
        headers: {'user-agent': 'Mozilla/5.0 (compatible; wall-of-shame-link-check)'},
        signal: AbortSignal.timeout(20000),
      });
      /* 403/429 are bot defences, not dead links — report, do not fail. */
      if (res.status >= 400 && ![403, 429].includes(res.status)) {
        fail(v.name, `source returned HTTP ${res.status}`);
      } else if (res.status >= 400) {
        console.log(`  note  ${v.name}: HTTP ${res.status} (bot defence, check by hand)`);
      }
    } catch (err) {
      fail(v.name, `source unreachable: ${err.message}`);
    }
  }));
}

const counts = {};
for (const v of vendors) counts[v.tier] = (counts[v.tier] || 0) + 1;

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  ✗ ' + p);
  process.exit(1);
}

console.log(`\n${vendors.length} brands, all valid.`);
console.log('  ' + TIERS.map((t) => `${t} ${counts[t] || 0}`).join('   '));
console.log(`  ${vendors.filter((v) => v.source).length} with sources`);
