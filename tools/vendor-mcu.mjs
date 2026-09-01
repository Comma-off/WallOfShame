/**
 * Rebuilds tools/vendor/material-color-utilities.mjs.
 *
 * The site itself ships zero dependencies, and assets/tokens.css is committed,
 * so the colour library is only needed when the seed changes. Rather than keep
 * a 158-entry node_modules permanently installed for that, the handful of
 * exports tools/generate-tokens.mjs uses are bundled into one vendored file.
 *
 * To update the colour library:
 *
 *   npm install --no-save @ktibow/material-color-utilities-nightly esbuild
 *   node tools/vendor-mcu.mjs
 *   npm run tokens && npm run build     # check the output actually changed as expected
 *   rm -rf node_modules
 */
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, existsSync, rmSync} from 'node:fs';
import {fileURLToPath, URL} from 'node:url';

const root = new URL('../', import.meta.url);
const path = (rel) => fileURLToPath(new URL(rel, root));

const PACKAGE = '@ktibow/material-color-utilities-nightly';
const esbuild = path('node_modules/.bin/esbuild');
const pkgJson = path(`node_modules/${PACKAGE}/package.json`);

for (const [what, where] of [['esbuild', esbuild], [PACKAGE, pkgJson]]) {
  if (!existsSync(where)) {
    console.error(`vendor-mcu: ${what} is not installed. Run:\n`);
    console.error(`  npm install --no-save ${PACKAGE} esbuild\n`);
    process.exit(1);
  }
}

const version = JSON.parse(readFileSync(pkgJson, 'utf8')).version;

/* Re-export only what the generator imports, so esbuild can drop the rest. */
const entry = path('.mcu-entry.mjs');
writeFileSync(entry, `export {
  Hct, DynamicScheme, Variant, MaterialDynamicColors, argbFromHex, hexFromArgb,
} from '${PACKAGE}';
`);

const outFile = path('tools/vendor/material-color-utilities.mjs');
mkdirSync(path('tools/vendor'), {recursive: true});

try {
  execFileSync(esbuild, [
    entry, '--bundle', '--format=esm', '--platform=neutral',
    '--minify', '--legal-comments=none', `--outfile=${outFile}`,
  ], {stdio: 'inherit'});
} finally {
  rmSync(entry, {force: true});
}

const header = `/**
 * VENDORED — do not edit. Regenerate with: node tools/vendor-mcu.mjs
 *
 * Source:  ${PACKAGE}@${version}
 *          https://github.com/material-foundation/material-color-utilities
 * License: Apache-2.0, full text in tools/vendor/LICENSE
 *
 * Bundled from that package's published build, minified, tree-shaken down to
 * the six exports tools/generate-tokens.mjs uses: Hct, DynamicScheme, Variant,
 * MaterialDynamicColors, argbFromHex, hexFromArgb.
 */
`;
writeFileSync(outFile, header + readFileSync(outFile, 'utf8'));

/* Ship the licence with the code it covers. */
writeFileSync(path('tools/vendor/LICENSE'), readFileSync(path(`node_modules/${PACKAGE}/LICENSE`), 'utf8'));

const kb = (readFileSync(outFile).length / 1024).toFixed(0);
console.log(`\ntools/vendor/material-color-utilities.mjs — ${kb} kB, from ${PACKAGE}@${version}`);
