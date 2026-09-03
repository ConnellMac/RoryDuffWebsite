# Rory Duff Website

Phase 1 foundation for the rebuilt Rory Duff website and Sacred Path.

## Requirements

- Node.js 24.x LTS
- npm 11.x
- Java 21 for Firebase emulator tests

## Commands

```bash
npm install
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:rules
npm run test:smoke
npm run build
```

The Firebase configuration uses the reserved local `demo-sacred-path` project ID. No real credentials are required. Copy `.env.example` to `.env.local` only for local overrides; real environment files are ignored.

Read `AGENTS.md` and the planning documents before making changes.
