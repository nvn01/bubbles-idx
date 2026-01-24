# Bubble IDX

A real-time bubble chart visualization for IDX30 stocks, powered by the T3 Stack (Next.js, Tailwind, Trpc, Prisma) and a custom Python scraper.

![Dashboard Preview](https://placehold.co/600x400?text=Bubble+Chart+Preview)

## 🚀 Quick Start (Development)

### Prerequisites
*   Node.js 18+
*   Docker Desktop (for local database)

### 1. Database Setup
Start a local PostgreSQL instance:
```bash
# In project root
docker compose up -d postgres
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database
This will create the schema and populate it with **150 sample historical records** so you can see data immediately properly without needing the scraper.
```bash
# Push schema to DB
npx prisma db push --force-reset

# Seed Master Data + Sample History
npx prisma db seed
```

### 4. Run App
```bash
npm run dev
```
Open `http://localhost:3000`.

---

## 🏗️ Architecture

### 1. Frontend (`/src`)
*   **Framework**: Next.js 15 (App Router)
*   **Visuals**: D3.js Force Layout Bubble Chart.
*   **Data**: Fetched via tRPC from Postgres.

### 2. Scraper (`/scrapper` - *Private Submodule*)
*   **Tech**: Python + PyAutoGUI.
*   **Function**:
    *   Runs on a schedule (Mon-Fri market hours).
    *   Fetches real-time price & change % from TradingView.
    *   Updates the `ticker` table in Postgres.

---

## 🤝 Contribution Guidelines

### Schema Updates
If you change `schema.prisma`:
1.  Run `npx prisma migrate dev --name <change_description>`.
2.  Commit the migration folder.
3.  **DO NOT** manually edit migration SQLs unless necessary.

### Data Sync (Optional)
If you want **real production data** instead of the sample seed:
1.  Ask the maintainer for access (VPN required).
2.  Run `.\sync_db.ps1` (Windows PowerShell) to dump/restore prod data to your localhost.
