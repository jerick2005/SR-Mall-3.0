# 🚀 Getting Started with SR-Mall

Welcome to the **SR-Mall Capstone Project**! Follow this guide to set up your local development environment.

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Must be running)
- [Git](https://git-scm.com/)

---

## 🛠️ First-Time Setup

Run these commands in order from the project root:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Automatical Setup**
   This command starts Docker, prepares the database, and seeds initial accounts.
   ```bash
   npm run setup
   ```

---

## 🔄 Updating the Project

If you already have the project installed and need to sync with latest changes:

1. **Pull Latest Code**
   ```bash
   git pull
   ```

2. **Update Dependencies & Database**
   ```bash
   npm install
   npm run setup
   ```

---

## 💻 Daily Development

To start the development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Credentials

Use these accounts to explore the different dashboards:

### 👑 Administrator Account
- **Email**: `srmall@admin.com`
- **Password**: `123123`
- **URL**: [localhost:3000/admindashboard](http://localhost:3000/admindashboard)

### 🏪 Tenant Account
- **Email**: `jerick@tenant.com`
- **Password**: `123123`
- **URL**: [localhost:3000/tenantdashboard](http://localhost:3000/tenantdashboard)

---

## 🗄️ Database Management

If you need to manualy manage the database:
- **Push Schema changes**: `npm run db:push`
- **Regenerate Prisma Client**: `npm run db:generate`
- **Reset/Seed Data**: `npm run db:seed`
- **DB Port**: `5435` (mapped from Docker)

---

## 📮 Support
If you encounter issues with Docker or Database connections, ensure **Docker Desktop** is running and that port `5435` is not being used by another application.
