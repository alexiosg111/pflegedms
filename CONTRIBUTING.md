# Contributing Guide

Thank you for your interest in contributing to the Pflegedienst Workspace!

## Development Setup

1. **Prerequisites**:
   - Node.js v20+
   - npm v10+
   - Git

2. **Installation**:
   ```bash
   git clone <repo-url>
   cd pflegedienst-workspace
   npm install
   ```

3. **Running Dev Server**:
   ```bash
   npm run dev
   ```

## Architecture Overview

- **Frontend**: Svelte 4, TailwindCSS, Vite
- **Backend (Desktop)**: Electron, Better-SQLite3
- **Data**: Local-first SQLite database with encryption (SQLCipher)

## Code Style

- We use **Prettier** for formatting and **ESLint** for linting.
- Run `npm run lint` before committing.
- Use TypeScript for all new files.

## Branching Strategy

- `main`: Stable production code.
- `develop`: Integration branch for next release.
- `feature/*`: New features.
- `fix/*`: Bug fixes.

## Pull Request Process

1. Create a feature branch.
2. Implement your changes with tests.
3. Update documentation if necessary.
4. Submit a PR to `develop`.
5. Ensure CI checks pass.

## Testing

- Unit Tests: `npm run test` (Vitest)
- E2E Tests: `npm run test:e2e` (Playwright)

## License
Proprietary software. Internal use only.
