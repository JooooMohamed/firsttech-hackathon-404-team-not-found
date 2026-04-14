# EasyPoints — Project Rules

## Database

- **Always use the live MongoDB Atlas database.** Never use mongodb-memory-server, local MongoDB, or any in-memory database.
- The connection string is in `server/.env` via `MONGODB_URI`. It must always point to the production Atlas cluster.
- Unit tests must mock Mongoose models — never spin up a separate database instance.

## Architecture

- **Monorepo**: pnpm workspaces with `server/`, `mobile/`, `packages/shared/`.
- **Backend**: NestJS 10 + MongoDB/Mongoose. All validation uses Joi (not class-validator).
- **Mobile**: React Native 0.73 + Zustand + Axios. Form validation uses Zod + react-hook-form.
- **Shared types**: `@easypoints/shared` in `packages/shared/` — all TypeScript interfaces live here.

## Code Conventions

- Server DTOs use Joi schemas in `server/src/dto/`.
- Guards: `JwtAuthGuard` for auth, `RolesGuard` with `@Roles()` decorator for authorization.
- Wallet operations must be atomic (`$inc` with upsert, never read-then-write).
- QR sessions use HMAC-SHA256 signed payloads (not plain random tokens).
- Every new server module gets a `.spec.ts` test file alongside the service.

## Testing

- Run tests: `pnpm --filter easypoints-server test`
- Tests use `@nestjs/testing` with mocked Mongoose models against the live DB connection.
- The existing `test-all.sh` at root contains 170+ curl-based API smoke tests.

## Deployment

- Server deploys via Docker on Render (see `render.yaml`).
- Dockerfile context is the monorepo root (not `server/`).
- CORS is restricted via `CORS_ORIGINS` env var (comma-separated). Empty = allow all (dev mode).
- Mobile API base URL is set in `mobile/src/constants/index.ts`.
