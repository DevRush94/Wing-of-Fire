#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WINGS OF FIRE — MODULAR COMPILER, SYNTAX VALIDATOR & DEPLOYMENT PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * Bundles segregated source modules into standalone, zero-dependency production
 * HTML distribution builds for Android WebView, Cloudflare/Termux, and Surge CDN.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

const MODULE_ORDER = [
  path.join(SRC_DIR, 'core', 'constants.js'),
  path.join(SRC_DIR, 'core', 'audio.js'),
  path.join(SRC_DIR, 'core', 'storage.js'),
  path.join(SRC_DIR, 'entities', 'player.js'),
  path.join(SRC_DIR, 'entities', 'weapons.js'),
  path.join(SRC_DIR, 'entities', 'enemies.js'),
  path.join(SRC_DIR, 'world', 'world.js'),
  path.join(SRC_DIR, 'render', 'vfx.js'),
  path.join(SRC_DIR, 'render', 'renderer.js'),
  path.join(SRC_DIR, 'ui', 'hud.js'),
  path.join(SRC_DIR, 'ui', 'screens.js'),
  path.join(SRC_DIR, 'input', 'input.js'),
  path.join(SRC_DIR, 'main.js')
];

const CSS_PATH = path.join(SRC_DIR, 'css', 'style.css');
const TEMPLATE_PATH = path.join(SRC_DIR, 'index.template.html');

// Output targets
const TARGET_ASSETS = path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'index.html');
const TARGET_DIST_INDEX = path.join(ROOT_DIR, 'dist', 'index.html');
const TARGET_DIST_200 = path.join(ROOT_DIR, 'dist', '200.html');
const TARGET_LOCAL_HOME = 'C:\\Users\\DELL\\wof.html';

console.log('\n🔥 ══════════════════════════════════════════════════════════════════');
console.log('   WINGS OF FIRE — MODULAR BUILD SYSTEM');
console.log('   Compiling 13 segregated modules into production distribution...');
console.log('══════════════════════════════════════════════════════════════════');

// 1. Read CSS and Template
const cssContent = fs.readFileSync(CSS_PATH, 'utf8').trim();
const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// 2. Concatenate and validate each JS module
const jsChunks = [];
let totalLines = 0;

for (const modPath of MODULE_ORDER) {
  const relPath = path.relative(SRC_DIR, modPath).replace(/\\/g, '/');
  if (!fs.existsSync(modPath)) {
    console.error(`❌ Missing module: ${relPath}`);
    process.exit(1);
  }
  const code = fs.readFileSync(modPath, 'utf8');
  const lines = code.split('\n').length;
  totalLines += lines;
  console.log(`   ✓ [Module] ${relPath.padEnd(25)} (${lines} lines)`);
  
  // Strip duplicate headers if needed and add to chunks
  jsChunks.push(`\n// ─── [MODULE: ${relPath}] ───\n` + code.trim());
}

// 3. Assemble complete bundle inside IIFE
const combinedJs = `(() => {\n'use strict';\n\n${jsChunks.join('\n\n')}\n\n})();`;

// 4. Validate Combined JavaScript Syntax
try {
  new Function(combinedJs);
  console.log('\n   ✨ Syntax validation: 100% CLEAN (0 syntax errors)');
} catch (err) {
  console.error('\n❌ Syntax compilation error in combined JavaScript:');
  console.error(err.message);
  process.exit(1);
}

// 5. Replace placeholders in template
let finalHtml = templateHtml
  .replace('/* {{INLINE_CSS}} */', cssContent)
  .replace('/* {{INLINE_JS}} */', combinedJs);

// 6. Write to all target locations
const targets = [
  { name: 'Android WebView Assets', path: TARGET_ASSETS },
  { name: 'Surge CDN dist/index.html', path: TARGET_DIST_INDEX },
  { name: 'Surge SPA dist/200.html', path: TARGET_DIST_200 },
  { name: 'Local Home Copy', path: TARGET_LOCAL_HOME }
];

console.log('\n📦 Writing distribution bundles:');
for (const tgt of targets) {
  try {
    const dir = path.dirname(tgt.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(tgt.path, finalHtml, 'utf8');
    const kb = (Buffer.byteLength(finalHtml, 'utf8') / 1024).toFixed(1);
    console.log(`   ✓ ${tgt.name.padEnd(28)} -> ${tgt.path} (${kb} KB)`);
  } catch (e) {
    console.warn(`   ⚠ Could not write to ${tgt.path}: ${e.message}`);
  }
}

// Copy favicon.ico to dist and assets
const srcFavicon = path.join(SRC_DIR, 'favicon.ico');
if (fs.existsSync(srcFavicon)) {
  const distFavicon = path.join(ROOT_DIR, 'dist', 'favicon.ico');
  const assetsFavicon = path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'favicon.ico');
  try {
    fs.copyFileSync(srcFavicon, distFavicon);
    fs.copyFileSync(srcFavicon, assetsFavicon);
    console.log('   ✓ Favicon (favicon.ico) synchronized to dist/ and assets/');
  } catch (e) {
    console.warn('   ⚠ Favicon sync warning:', e.message);
  }
}

console.log('\n🚀 BUILD COMPLETE!');
console.log(`   Total Modular Source Lines: ${totalLines}`);
console.log(`   Bundle Size: ${(Buffer.byteLength(finalHtml, 'utf8') / 1024).toFixed(1)} KB`);
console.log('══════════════════════════════════════════════════════════════════\n');

// 7. Check for deployment flags (--deploy)
const args = process.argv.slice(2);
if (args.includes('--deploy')) {
  console.log('🌐 Executing Automated Deployment Pipeline...');
  
  // Push to phone via adb (2-step via /data/local/tmp for non-root Termux permissions)
  try {
    console.log('📱 Pushing to Xperia Phone over ADB WiFi (192.168.1.200:5555)...');
    execSync('adb -s 192.168.1.200:5555 push "' + TARGET_ASSETS + '" /data/local/tmp/wof.html', { stdio: 'inherit' });
    execSync('adb -s 192.168.1.200:5555 shell "run-as com.termux cp /data/local/tmp/wof.html /data/data/com.termux/files/home/wof.html"', { stdio: 'inherit' });
    console.log('   ✓ Phone wof.html updated successfully!');
  } catch (e) {
    console.warn('   ⚠ ADB phone push skipped or failed:', e.message);
  }

  // Deploy to Surge
  try {
    console.log('☁ Deploying to Surge CDN (https://wingsoffire.surge.sh)...');
    const distDir = path.join(ROOT_DIR, 'dist');
    execSync(`npx --registry=https://registry.npmjs.org/ -y surge "${distDir}" wingsoffire.surge.sh`, { stdio: 'inherit' });
    console.log('   ✓ Surge CDN deployed live at https://wingsoffire.surge.sh !');
  } catch (e) {
    console.warn('   ⚠ Surge deployment skipped or failed:', e.message);
  }
}
