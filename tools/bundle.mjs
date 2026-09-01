/**
 * Inlines index.html into a single self-contained page at dist/index.html.
 *
 * The output is body-level markup only — no <!doctype>, <html>, <head> or
 * <body> — because the Artifact host wraps it in its own skeleton. Opening
 * dist/index.html straight off disk still works: browsers build the missing
 * skeleton themselves.
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath, URL} from 'node:url';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(fileURLToPath(new URL(rel, root)), 'utf8');

const readBinary = (rel) => readFileSync(fileURLToPath(new URL(rel, root)));

/* The single-file build has no sibling files to link to, so the icons ride
   along as data URIs. The SVG is URL-encoded rather than base64 so it stays
   readable and compresses well; the PNGs have no such option. */
const svgDataUri = (rel) =>
  'data:image/svg+xml,' + encodeURIComponent(read(rel).trim())
    .replace(/'/g, '%27').replace(/"/g, '%22');
const pngDataUri = (rel) =>
  'data:image/png;base64,' + readBinary(rel).toString('base64');

let html = read('index.html');

// Keep everything between </head> and </body>, then re-attach title + assets.
const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
const fontLink = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/)[0];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];

const inline = body
  .replace(/\s*<script src="[^"]*"><\/script>/g, '')
  .trimEnd();

const out = `<title>${title}</title>
<link rel="icon" href="${svgDataUri('assets/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${pngDataUri('assets/favicon-32.png')}" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="${pngDataUri('assets/apple-touch-icon.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink}
<style>
${read('assets/tokens.css')}
${read('assets/styles.css')}
</style>
${inline}
<script>
${read('data/vendors.js')}
</script>
<script>
${read('assets/app.js')}
</script>
`;

mkdirSync(fileURLToPath(new URL('dist/', root)), {recursive: true});
writeFileSync(fileURLToPath(new URL('dist/index.html', root)), out);
console.log(`dist/index.html — ${(Buffer.byteLength(out) / 1024).toFixed(1)} kB`);
