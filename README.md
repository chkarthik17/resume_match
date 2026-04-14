# Resume Matcher

Rule-based resume parsing and JD matching built with Nest.js, Prisma, PostgreSQL, and a static frontend.

Extraction is done with regex, heuristics, curated skills, and PDF/DOCX parsing.

## Layout

```text
resume-matcher/
├── frontend/
│   └── index.html
├── backend/
│   ├── config/
│   ├── nest/
│   ├── prisma/
│   ├── src/
│   └── uploads/
│   └── dist/
├── prisma.config.ts
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## Backend Stack

| Requirement | Implementation |
|---|---|
| Nest.js | `backend/nest/main.ts` |
| Node.js | Runtime platform |
| Express.js | Nest uses `@nestjs/platform-express` |
| Prisma ORM | `backend/prisma/schema.prisma` |
| PostgreSQL | Stores resumes, JDs, match runs, and match results |

## Features

| Feature | Details |
|---|---|
| Resume Parsing | Name, email, phone, years of experience, skills |
| JD Parsing | Salary, experience, required/optional skills, role summary |
| Skill Matching | Rule-based skill extraction and alias matching |
| Matching Score | `(matched JD skills / total JD skills) * 100` |
| REST API | Parse, match, and database endpoints |
| Web UI | Upload resume and compare against multiple JDs |

## Outcome Flow

The screenshots below show the user flow from upload to final JSON output.

<img width="1632" height="918" alt="Screenshot 2026-04-14 113349" src="https://github.com/user-attachments/assets/783a1b7f-6e21-46d1-92c2-b3805c8e26cd" />

<img width="1326" height="850" alt="Screenshot 2026-04-14 113415" src="https://github.com/user-attachments/assets/4814071d-08ca-4db3-addb-3a37238e2d2a" />

<img width="1286" height="910" alt="Screenshot 2026-04-14 113438" src="https://github.com/user-attachments/assets/2bf1fb0f-2516-4148-ba75-178fe2a32a03" />

## Setup

Install dependencies:

```bash
npm install
npm run prisma:generate
```

Create a `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume
DB_USER=postgres
DB_PASSWORD=*****
DATABASE_SSL=false
DB_POOL_MAX=10
```

Sync the Prisma schema:

```bash
npm run db:push
```

Build the backend:

```bash
npm run build
```

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## API

### Core

- `GET /api/health`
- `GET /api/docs`
- `GET /api/db/health`

### Matching

- `POST /api/match`
- `POST /api/parse/resume`
- `POST /api/parse/jd`

### Database

- `GET /api/resumes`
- `GET /api/resumes/:id`
- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/matches`
- `GET /api/matches/:id`

## Database Tables

Created from `backend/prisma/schema.prisma`:

- `resumes`
- `job_descriptions`
- `match_runs`
- `match_results`

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Nest backend |
| `npm run build` | Compile TypeScript |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run db:push` | Sync database schema |
| `npm run test` | Build verification |

## Notes

- The frontend is static and lives in `frontend/index.html`.
- The backend saves successful match runs to PostgreSQL when the database env vars are set.
- Compiled files are written to `backend/dist/`.
- Store README screenshots in `docs/screenshots/` using the filenames referenced above.
