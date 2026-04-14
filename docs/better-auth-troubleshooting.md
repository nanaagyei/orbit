# Better Auth Troubleshooting

## Installation Issues (npm install fails)

If `npm install` fails with **EPERM** or **ENOENT** errors on Windows:

### 1. Close all processes using the project
- Stop the dev server (`Ctrl+C` in the terminal running `npm run dev`)
- Close any IDE/editor file watchers on `node_modules`
- Close Prisma Studio or other tools that might lock files

### 2. Clean reinstall (Windows)

In a **new** terminal (Command Prompt or PowerShell as Administrator if needed):

```bash
# Remove node_modules and cache
rmdir /s /q node_modules 2>nul
rmdir /s /q .next 2>nul

# Clear npm cache
npm cache clean --force

# Reinstall (uses legacy-peer-deps from .npmrc)
npm install
```

Or in Git Bash / WSL:
```bash
rm -rf node_modules .next
npm cache clean --force
npm install
```

### 3. If you still get peer dependency errors
```bash
npm install --legacy-peer-deps
```

## Prisma generate / Sign-up errors

The project uses Prisma 6 with `@prisma/adapter-pg` for PostgreSQL. If you see:
- `Cannot find module 'query_compiler_bg.postgresql.wasm-base64.js'`
- `Cannot read properties of undefined (reading 'graph')` on sign-up

Run a clean reinstall and regenerate:

```bash
rm -rf node_modules src/generated .next
npm cache clean --force
npm install
npx prisma generate
```

If `npm install` reports "Lock compromised", try:
```bash
rm package-lock.json
npm install
npx prisma generate
```

## Module resolution ("Can't resolve 'better-auth'")

The project is configured with **transpilePackages: ['better-auth']** to ensure Next.js bundles the package correctly.

If you still see "Module not found" after a clean install:
1. Ensure `node_modules/better-auth` exists
2. Try `npm run build` — if build works but dev fails, it may be a Turbopack dev cache issue; delete `.next` and run `npm run dev` again

## Middleware

The middleware uses a **direct cookie check** (no `better-auth/cookies` import) to avoid Edge Runtime issues. Default session cookie: `better-auth.session_token`.
