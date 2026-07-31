# CARPI Backend

Node.js + Express + Sequelize + PostgreSQL API for CARPI Recognises applications.

## Setup

1. Copy `.env.example` to `.env` and configure PostgreSQL credentials.
2. Create the database: `createdb carpi` (or via pgAdmin).
3. Install dependencies:

```bash
npm install
```

4. Start the server (tables auto-sync on start):

```bash
npm run dev
```

API runs at `http://localhost:4000`.

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/recognition/applications` | Create draft application |
| GET | `/api/recognition/applications/:id` | Get application |
| PATCH | `/api/recognition/applications/:id/step/:stepId` | Save wizard step |
| POST | `/api/recognition/applications/:id/submit` | Submit application |
| POST | `/api/recognition/applications/:id/files` | Upload file (multipart) |
| DELETE | `/api/recognition/applications/:id/files/:fileId` | Delete file |

## Frontend

The form is at **`/carpi/form`** (not linked in site navigation).

Set in `carpi-client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
