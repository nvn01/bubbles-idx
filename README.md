# Bubble IDX

A real-time bubble chart visualization for IDX stocks.

---

## 🚀 Quick Start (Development)

### Prerequisites
* **Node.js** (v18+)
* **Docker Desktop** (to run local database and caching instances)

### 1. Spin Up Local Services
From the **root workspace directory** (where `docker-compose.yml` is located), spin up the local PostgreSQL and Redis containers:
```bash
docker compose up -d postgres redis
```

### 2. Configure Environment Variables
Inside the `bubble-idx` directory, create a `.env` or `.env.local` file (it is automatically ignored by Git):
```env
DATABASE_URL="postgresql://postgres:root@localhost:5433/bubble_db?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV=development
```

### 3. Install Dependencies
Navigate into the `bubble-idx` directory and install the packages:
```bash
npm install
```

### 4. Initialize & Seed Database
Reset your local database to a clean state, apply schemas, and populate it with **150 sample historical records** so you can test features instantly without running the scraper:
```bash
# Push Prisma schema to DB
npx prisma db push --force-reset

# Seed Master Data + Sample History
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Contribution Guidelines

### Prisma Schema & Migrations
If you modify `prisma/schema.prisma`:
1. Generate and run a migration locally:
   ```bash
   npx prisma migrate dev --name <change_description>
   ```
