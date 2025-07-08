# HotChoc.Monster

This project contains a Next.js frontend for rating hot chocolate drinks. The original app stored all data in `localStorage`.

A simple Express backend has been added under `server/` to provide a real API for user management and ratings. Data is persisted in a SQLite database so user accounts and ratings are shared across devices.
Large photo uploads are supported by configuring the Express JSON body parser to accept payloads up to 10 MB.

## Running the frontend

The frontend source lives in the `app/` directory and expects to be part of a Next.js project. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Running the backend

```bash
cd server
npm install
npm start
```

The API listens on port `3001` by default and exposes the following endpoints:

- `POST /api/register` – create a user
- `POST /api/login` – obtain a JWT token and the logged-in user
- `GET /api/ratings` – list all ratings
- `POST /api/ratings` – create a rating (requires `Authorization: Bearer <token>`)
- `GET /api/ratings/:id` – fetch a single rating
- `GET /api/user/ratings` – list ratings created by the authenticated user

This backend uses a small SQLite database for persistence so ratings and users are available from any device.

## Running with Docker Compose

You can run both the frontend and backend using Docker. Build and start the
containers using:

```bash
docker compose up --build
```

The frontend will be available on [http://localhost:3000](http://localhost:3000)
and the API on [http://localhost:3001](http://localhost:3001).

The frontend reads the API base URL from the `NEXT_PUBLIC_API_URL` environment
variable. Docker Compose builds the image with this value set to
`http://localhost:3001` so the browser can reach the backend container.
When running locally without Docker you should export
`NEXT_PUBLIC_API_URL=http://localhost:3001` before running `npm run dev` or
`next build`.

## Development

Run tests and format code using:

```bash
npm install
npm test
npm run format
```
