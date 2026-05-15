---
name: Bun
description: Use when building, testing, and deploying JavaScript/TypeScript applications. Reach for Bun when you need to run scripts, manage packages, bundle code, or test applications with a single unified toolkit that's significantly faster than Node.js, npm, and Jest.
metadata:
    mintlify-proj: bun
    version: "1.0"
---

# Bun Skill Reference

## Product Summary

Bun is an all-in-one JavaScript/TypeScript toolkit written in Zig and powered by JavaScriptCore. It ships as a single executable (`bun`) that replaces Node.js, npm, Jest, and esbuild with dramatically faster alternatives. Key components: **Runtime** (`bun run`) for executing JS/TS files, **Package Manager** (`bun install`) for dependency management, **Test Runner** (`bun test`) for Jest-compatible testing, and **Bundler** (`bun build`) for production builds. Configuration lives in `bunfig.toml` (optional) and `package.json`. Primary docs: https://bun.com/docs

## When to Use

- **Running scripts**: Execute TypeScript/JSX directly without compilation overhead (`bun run script.ts`)
- **Package management**: Install dependencies 25x faster than npm with `bun install`
- **Testing**: Run Jest-compatible tests with TypeScript support and watch mode (`bun test`)
- **Building**: Bundle applications for browsers, servers, or standalone executables (`bun build`)
- **HTTP servers**: Create high-performance servers with `Bun.serve()` and built-in routing
- **File operations**: Read/write files with optimized APIs (`Bun.file()`, `Bun.write()`)
- **Replacing Node.js workflows**: Drop-in replacement for existing Node.js projects with minimal changes

## Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| Initialize project | `bun init` |
| Run file/script | `bun run script.ts` or `bun script.ts` |
| Run package.json script | `bun run start` |
| Install dependencies | `bun install` |
| Add package | `bun add react` |
| Add dev dependency | `bun add -d @types/node` |
| Remove package | `bun remove react` |
| Run tests | `bun test` |
| Build bundle | `bun build ./src/index.ts --outdir ./dist` |
| Execute package binary | `bunx cowsay "Hello"` |

### Configuration Files

| File | Purpose |
|------|---------|
| `bunfig.toml` | Bun-specific configuration (optional) |
| `package.json` | Project metadata, scripts, dependencies |
| `tsconfig.json` | TypeScript compiler options |
| `bun.lock` | Lockfile (text format, replaces package-lock.json) |

### Key APIs

| API | Purpose |
|-----|---------|
| `Bun.serve()` | Create HTTP server with routing |
| `Bun.file(path)` | Reference file for reading |
| `Bun.write(dest, data)` | Write data to file/stdout |
| `Bun.build()` | Programmatic bundling |
| `import.meta.dir` | Current directory |
| `import.meta.file` | Current file path |

## Decision Guidance

### When to Use `bun run` vs `bun`

| Scenario | Use |
|----------|-----|
| Running a script with arguments | `bun run script.ts` |
| Direct file execution | `bun script.ts` |
| Running package.json script | `bun run start` |
| Need to pass flags to Bun | `bun --hot run dev` |

### When to Use `bun install` vs `bun add`

| Scenario | Use |
|----------|-----|
| Install all dependencies from package.json | `bun install` |
| Add a new package | `bun add react` |
| Add dev dependency | `bun add -d typescript` |
| Install in CI/CD (frozen lockfile) | `bun ci` |

### Bundler Target Selection

| Target | Use Case |
|--------|----------|
| `browser` | Client-side code for web browsers (default) |
| `bun` | Server-side code for Bun runtime |
| `node` | Code for Node.js runtime |

### Installation Strategy

| Strategy | Use Case |
|----------|----------|
| `hoisted` | Traditional npm behavior, shared node_modules (default for single packages) |
| `isolated` | Strict dependency isolation, prevents phantom dependencies (default for workspaces) |

## Workflow

### 1. Initialize and Set Up
- Run `bun init` to scaffold a new project
- Choose template: Blank, React, or Library
- Verify `tsconfig.json` includes `@types/bun` for type support
- Create `bunfig.toml` only if you need Bun-specific configuration

### 2. Manage Dependencies
- Use `bun add <package>` to install packages (automatically updates package.json and bun.lock)
- Use `bun add -d <package>` for dev dependencies
- Run `bun install` to install all dependencies from package.json
- Commit `bun.lock` to version control for reproducible installs

### 3. Write and Run Code
- Write TypeScript/JSX directly—no compilation step needed
- Use `bun run script.ts` to execute files
- Define scripts in `package.json` and run with `bun run <script>`
- Use `--watch` flag for file watching: `bun run --watch script.ts`

### 4. Test Your Code
- Create test files matching patterns: `*.test.ts`, `*.spec.ts`, `*_test.ts`, `*_spec.ts`
- Import from `bun:test`: `import { test, expect, describe } from "bun:test"`
- Run `bun test` to execute all tests
- Use `bun test --watch` for watch mode
- Filter tests with `bun test --test-name-pattern <pattern>`

### 5. Build for Production
- Use `bun build ./src/index.ts --outdir ./dist` for bundling
- Specify target: `--target browser`, `--target bun`, or `--target node`
- Enable minification: `--minify`
- Generate sourcemaps: `--sourcemap linked`
- For full-stack apps, use `--target bun` with HTML imports

### 6. Deploy
- For Bun runtime: Deploy the bundled output directly
- For Node.js: Use `--target node --format cjs`
- Use `bun build --compile` to create standalone executables
- Verify with `bun ci` in CI/CD pipelines (frozen lockfile mode)

## Common Gotchas

- **TypeScript errors on Bun global**: Install `@types/bun` as dev dependency and configure `tsconfig.json` with `"lib": ["ESNext"]` and `"module": "Preserve"`
- **Lifecycle scripts disabled by default**: Add trusted packages to `trustedDependencies` in package.json to allow postinstall scripts
- **Auto-install disabled in production**: Set `install.auto = "disable"` in bunfig.toml for security; use explicit `bun install` instead
- **Lockfile format changed**: Bun v1.2+ uses text-based `bun.lock` instead of binary `bun.lockb`; old lockfiles auto-migrate
- **Node.js compatibility incomplete**: Check `/runtime/nodejs-compat` for unsupported APIs; use `node:` prefix for Node.js modules
- **Idle timeout on servers**: `Bun.serve()` closes idle connections after 10 seconds; use `server.timeout(req, 0)` for long-lived streams
- **Environment variables not auto-inlined in bundles**: Use `env: "inline"` or `env: "PUBLIC_*"` in `bun build` to inject env vars
- **Peer dependencies installed by default**: Unlike npm, Bun installs peer dependencies automatically; use `--omit peer` to skip
- **Minification doesn't downconvert syntax**: Bun preserves modern JavaScript syntax; transpile separately if targeting older browsers
- **Plugins only in JavaScript API**: Bundler plugins work with `Bun.build()` or `bunfig.toml`, not CLI `bun build` directly

## Verification Checklist

Before submitting work with Bun:

- [ ] Run `bun install` to verify dependencies resolve without errors
- [ ] Run `bun test` and confirm all tests pass
- [ ] Run `bun build` and verify output files are generated in `outdir`
- [ ] Test the built output: `bun ./dist/index.js` or `node ./dist/index.js` (if target=node)
- [ ] Check `bun.lock` is committed to version control (for reproducible installs)
- [ ] Verify `bunfig.toml` contains only necessary Bun-specific config
- [ ] Confirm TypeScript files have no type errors (use `bun run tsc --noEmit` if needed)
- [ ] Test in target environment: browser (dev tools), Bun runtime, or Node.js
- [ ] For servers: verify `Bun.serve()` listens on correct port and routes work
- [ ] For packages: test with `bun add ./local-path` to verify package.json exports

## Resources

- **Comprehensive navigation**: https://bun.com/docs/llms.txt
- **HTTP Server API**: https://bun.com/docs/runtime/http/server
- **Package Manager**: https://bun.com/docs/pm/cli/install
- **Test Runner**: https://bun.com/docs/test/index
- **Bundler**: https://bun.com/docs/bundler/index

---

> For additional documentation and navigation, see: https://bun.com/docs/llms.txt