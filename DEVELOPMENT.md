# Development Guide – Pflegedienst Workspace

## Getting Started

### Prerequisites
- Node.js 20 LTS
- npm 10+
- Git

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd pflegedienst-workspace

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

### Development Workflow

#### **Hot Module Replacement (HMR)**
- Frontend reloads automatically when you save Svelte/TypeScript files (Port 5173)
- Electron Main Process requires manual restart (coming in Phase 1, PR 1 config)

#### **Code Style**
- Prettier runs automatically on save (configured in `.vscode/settings.json`)
- ESLint checks code style (run with `npm run lint`)
- Format all files: `npm run format`

#### **Type Safety**
- Full TypeScript strict mode enabled
- Run type check: `npm run type-check`
- Never ignore type errors!

---

## Project Structure

```
src/
├── core/               # Shared components & services
│   ├── shell/         # Main layout components
│   ├── components/    # Reusable UI components
│   ├── stores/        # Svelte stores for state
│   ├── services/      # Business logic
│   ├── database/      # Database layer (Phase 1, PR 2)
│   ├── auth/          # Authentication (Phase 1, PR 3)
│   └── utils/         # Helper functions
│
└── modules/           # Feature modules
    ├── patientenakte/     # Patient records (Phase 2)
    ├── posteingang/       # Mailbox routing (Phase 3)
    ├── vertragsmanagement/    # Contracts (Phase 4)
    ├── rechnungsmanagement/   # Invoicing (Phase 5)
    └── qualitaetsmanagement/  # QM Documents (Phase 6)
```

---

## Key Commands

### Development
```bash
npm run dev              # Start dev server with HMR
npm run type-check      # Type checking
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Testing
```bash
npm run test            # Run tests in watch mode
npm run test:ui         # Open Vitest UI
npm run test:e2e        # Run Playwright tests
```

### Building
```bash
npm run build           # Build for production
npm run build:vite      # Build Vite (renderer)
npm run build:electron  # Build TypeScript (main/preload)
npm run preview         # Preview production build
npm run dist            # Package Electron app
npm run dist:win        # Windows only
npm run dist:linux      # Linux only
npm run dist:mac        # macOS only
```

---

## Component Development

### Creating a Svelte Component

```svelte
<script lang="ts">
  // Props
  export let title: string = '';
  export let onClick: () => void = () => {};

  // State
  let count = 0;

  // Methods
  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  {title}: {count}
</button>

<style>
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
  }
</style>
```

### Using Stores

```svelte
<script lang="ts">
  import { authStore } from '@core/stores/authStore';

  // Auto-subscribe with $
  $: user = $authStore.username;
  $: isAuth = $authStore.isAuthenticated;
</script>

{#if isAuth}
  <p>Hello, {user}!</p>
{/if}
```

---

## Database Development (Phase 1, PR 2)

Database services will be in `src/main/services/db.ts`:

```typescript
import Database from 'better-sqlite3';

class DatabaseService {
  private db: Database.Database | null = null;

  async initialize(masterPassword: string): Promise<void> {
    // SQLCipher encryption
  }

  query<T>(sql: string, params?: unknown[]): T[] {
    // Safe parameterized queries
  }

  execute(sql: string, params?: unknown[]): void {
    // INSERT/UPDATE/DELETE
  }

  transaction<T>(fn: () => T): T {
    // Transactional operations
  }
}
```

---

## IPC Communication (Electron)

### Sending data from Renderer → Main

```typescript
// In Svelte component
const result = await window.api.queryDatabase('SELECT * FROM patients');

const files = await window.api.selectFile();
```

### Handling in Main Process

```typescript
// In electron-main.ts
ipcMain.handle('db:query', async (event, sql, params) => {
  return db.query(sql, params);
});
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// src/core/stores/__tests__/authStore.test.ts
import { describe, it, expect } from 'vitest';
import { authStore } from '../authStore';

describe('AuthStore', () => {
  it('should authenticate user', () => {
    authStore.login('TestUser');
    // Assertions...
  });
});
```

### Component Tests

```typescript
import { render } from '@testing-library/svelte';
import Button from '@core/components/Button.svelte';

it('renders button', () => {
  const { getByText } = render(Button, { props: { label: 'Click me' } });
  expect(getByText('Click me')).toBeTruthy();
});
```

---

## Debugging

### Chrome DevTools
- Opens automatically in dev mode
- Inspect elements, debug TypeScript, check network (IPC)

### VS Code Debugging
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["."],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

---

## Git Workflow

### Branch Naming
- `feature/phase-X-module-Y` for new features
- `fix/issue-description` for bug fixes

### Commit Messages
```
feat(core): add login component
docs(database): update schema documentation
fix(stores): correct auth state initialization
```

### Before Pushing
```bash
npm run type-check   # No type errors
npm run lint         # No lint errors
npm run format       # Code formatted
npm run test -- --run  # Tests pass
```

---

## Performance Tips

1. **Lazy Load Modules**: Only import when needed
2. **Use Svelte Stores**: No unnecessary re-renders
3. **Code Split**: vite automatically splits bundle
4. **Cache Queries**: Use stores to cache DB results
5. **Avoid N+1**: Batch database queries

---

## Common Issues

### "Module not found" errors
- Check path alias in `tsconfig.json`
- Verify import path matches file structure

### HMR not working
- Check if Vite dev server is running on 5173
- Clear browser cache
- Restart dev server

### Database locked
- Only one Electron instance can access DB
- Close other instances

### Prettier not formatting
- Restart VS Code
- Check `.prettierrc` is valid JSON

---

## Resources

- [Svelte Docs](https://svelte.dev/docs)
- [Vite Docs](https://vitejs.dev/)
- [Electron Docs](https://www.electronjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Support

For questions about architecture or implementation, refer to:
- `ARCHITECTURE_OVERVIEW.md` – Overall design
- `DATABASE_SCHEMA.md` – Data model
- `PROJECT_STRUCTURE.md` – Folder organization
- `WORKFLOW_PSEUDOCODE.md` – Module workflows

Happy coding! 🚀
