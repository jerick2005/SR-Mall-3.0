---
description: How to start the SR-Mall development environment
---

### Prerequisites
- Node.js 18+
- Docker Desktop (Running)
- pnpm `npm install -g pnpm`

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Start PostgreSQL Container
```bash
docker-compose up -d
```
*Note: The database is mapped to port 5435 internally to avoid host conflicts.*

### Step 3: Run Database Migrations
```bash
pnpm --filter @srmall/database run db:push
```

### Step 4: Run Development Server
```bash
pnpm run dev
```

### Step 5: (Optional) Seed Example Data
// turbo
```bash
node packages/database/seed_accounts.js
node packages/database/seed_spaces.js
```

### Authentication Details
- **Admin:** srmal@admin.com / 123123
- **Tenant:** jerick@tenant.com / 123123
