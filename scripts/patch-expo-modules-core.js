const fs = require('fs');
const path = require('path');

function patchExpoModulesCore() {
  const pkgPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'package.json');
  const pkgDir = path.dirname(pkgPath);
  try {
    if (!fs.existsSync(pkgPath)) {
      return; // Not installed yet
    }
    const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    const indexJsPath = path.join(pkgDir, 'index.js');
    const srcIndexTsPath = path.join(pkgDir, 'src', 'index.ts');

    const hasIndexJs = fs.existsSync(indexJsPath);
    const hasSrcIndexTs = fs.existsSync(srcIndexTsPath);

    // Only patch when TS source is missing but JS exists
    if (!hasIndexJs || hasSrcIndexTs) {
      return;
    }

    let changed = false;

    // Fix "main"
    if (json.main === 'src/index.ts') {
      json.main = 'index.js';
      changed = true;
    }

    // Fix any export condition that points to ./src/index.ts
    if (json.exports && json.exports['.']) {
      const exp = json.exports['.'];
      if (typeof exp === 'string') {
        if (exp === './src/index.ts') {
          json.exports['.'] = './index.js';
          changed = true;
        }
      } else if (typeof exp === 'object') {
        for (const key of Object.keys(exp)) {
          if (exp[key] === './src/index.ts') {
            exp[key] = './index.js';
            changed = true;
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
      console.log('[postinstall] Patched expo-modules-core package.json to point to index.js for all conditions');
    }
  } catch (e) {
    console.warn('[postinstall] Failed to patch expo-modules-core:', e?.message || e);
  }
}

patchExpoModulesCore();
