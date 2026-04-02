# Database Migration Guide

## Changes Made:
- PostgreSQL Password: `admin123`
- Database Name: `srmalldb`
- Username: `postgres`

## Migration Steps (Data Preservation):

### 1. Stop Current Container
```bash
docker-compose down
```

### 2. Backup Existing Data
```bash
# Create backup directory
mkdir -p db_backup

# Backup the existing database
docker run --rm -v srmall_pgdata:/data -v $(pwd)/db_backup:/backup \
  postgres:15-alpine tar czf /backup/srmall_backup.tar.gz -C /data .
```

### 3. Start New Container with Updated Configuration
```bash
# Start with new configuration
docker-compose up -d db

# Wait for PostgreSQL to be ready
sleep 10
```

### 4. Create New Database and Restore Data
```bash
# Connect to the new container
docker exec -it srmall_db_local bash

# Inside the container, create the new database
psql -U postgres -c "CREATE DATABASE srmalldb;"

# Exit the container
exit
```

### 5. Restore Data to New Database
```bash
# Restore the data to the new database
docker run --rm -v srmall_pgdata:/data -v $(pwd)/db_backup:/backup \
  postgres:15-alpine tar xzf /backup/srmall_backup.tar.gz -C /data

# Restart the container to apply changes
docker-compose restart db
```

### 6. Update Application Dependencies
```bash
# Install dependencies and regenerate Prisma client
pnpm install
cd packages/database
pnpm db:generate
cd ../..
```

### 7. Verify Connection
```bash
# Test the database connection
cd apps/web
pnpm dev
```

## Updated Configuration Files:
- ✅ `docker-compose.yml` - Updated with new credentials
- ✅ `.env` - Created with new DATABASE_URL
- ✅ `packages/database/src/index.ts` - Updated fallback URL

## Important Notes:
- All data is preserved through the volume backup/restore process
- The database container name remains the same
- Port mapping (5435:5432) is unchanged
- Application will automatically use the new configuration

## Troubleshooting:
If you encounter connection issues:
1. Verify the container is running: `docker ps`
2. Check logs: `docker logs srmall_db_local`
3. Test connection: `docker exec -it srmall_db_local psql -U postgres -d srmalldb -c "\dt"`
