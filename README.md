# AssetSphere

Smart Asset Management & Resource Allocation Platform built with Next.js 15,
TypeScript, Tailwind CSS, Auth.js, MongoDB Atlas, and a service-layer
architecture.

## Getting Started

1. Create your environment file:

```
cp .env.example .env.local
```

2. Fill out the required values in `.env.local`.

3. Run the development server:

```
npm run dev
```

Open http://localhost:3000 to view the application.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Lint the codebase
- `npm run format` - Format with Prettier

## Architecture

- `src/app` - App Router pages and API route handlers
- `src/models` - Mongoose models
- `src/services` - Business logic and data workflows
- `src/validators` - Zod validation schemas
- `src/components` - UI, landing, dashboard, charts, and forms
- `src/lib` - Auth, database, and shared utilities

## Core Features

- Role-based access control with JWT sessions
- Inventory management and asset availability enforcement
- Booking workflows with audit logs and notifications
- Analytics dashboard with utilization charts
- QR-ready workflows (library wiring included)

## Environment Variables

See `.env.example` for the required variables.
