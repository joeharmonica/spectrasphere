# SpectraSphere Development Lessons

This file contains lessons learned from corrections and mistakes to prevent them from recurring.

## Lessons

### 1. Vite ESM & CJS Import Issues
- **Issue**: `SyntaxError: Importing binding name 'default' cannot be resolved by star export entries` occurs when using default imports (`import Plotly from 'plotly.js-dist'`) for CJS/UMD modules that Vite doesn't correctly wrapper as having a default export.
- **Solution**: Use namespace imports (`import * as Plotly from 'plotly.js-dist'`) or specific dist file imports. Additionally, ensure problematic libraries are included in `optimizeDeps.include` in `vite.config.ts`.

### 2. Git Repository Initialization
- **Action**: Always double-check `.git` exists before pushing. If missing, initialize (`git init`), add files, commit, and then add the remote.

### 3. `ml-pls` Constructor Requirements
- **Issue**: The `PLS` constructor from `ml-pls` requires a second argument (options object) even if empty, and it may not be correctly typed in all environments.
- **Solution**: Always pass an empty object `{} as any` as the second argument to the `PLS` constructor: `new PLS({ latentVectors: n }, {} as any)`.
