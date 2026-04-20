---
description: How to start the SR-Mall development environment
---

### Prerequisites

- Node.js 18+
- Docker Desktop (Running)
- npm (Standard with Node.js)

### Step 1: Install Dependencies

Install all packages from the root directory:

```bash
npm install
```

### Step 2: Start PostgreSQL Container

Spin up the local database using Docker:

```bash
docker-compose up -d
```

_Note: The database is mapped to port **5435** to avoid conflicts._

### Step 3: Prepare the Database

Generate the Prisma client and push the schema to the local database:

```bash
npm run db:generate
cd packages/database && npm run db:push
```

### Step 4: Seed Initial Data

Populate the database with the required admin and tenant accounts:

// turbo

```bash
npm run db:seed
```

### Step 5: Run Development Server

Start the Next.js web application:

```bash
npm run dev
```

### Access & Credentials

- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admindashboard](http://localhost:3000/admindashboard)
  - `srmall@admin.com` / `123123`
- **Tenant Dashboard:** [http://localhost:3000/tenantdashboard](http://localhost:3000/tenantdashboard)
  - `jerick@tenant.com` / `123123`
