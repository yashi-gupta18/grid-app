# PixelClaim 🎨

A real-time collaborative grid application where users claim tiles and see updates instantly across all connected clients.

### Features
- Interactive 25 × 25 grid with 625 tiles
- Real-time synchronization using Socket.IO
- Persistent tile ownership with MongoDB
- Atomic claim handling to prevent conflicts
- User colors, live statistics, and leaderboard

### Tech Stack
React, Tailwind CSS, Node.js, Express.js, Socket.IO, MongoDB, and Mongoose.

### Run Locally
Run these commands from the `grid-app` repository root:

```bash
npm install
npm run install:all
npm run dev
```

For a fresh checkout, copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env` before starting. Keep your existing `.env` files when updating an installation.

Set `MONGODB_URI` in `server/.env` to your Atlas connection string with `/pixelclaim` before the query string. URL-encode special characters in the database username and password. Allow your machine's IP address in Atlas Network Access and give the database user read/write access to `pixelclaim`. The server loads `server/.env` relative to its configuration file.

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:4000`. The backend automatically seeds missing board tiles on startup.

Run `npm test` for backend tests and `npm run build` for the frontend production build.

### Engineering Highlights
Uses server-side validation, atomic database updates, and WebSocket events to maintain consistent ownership across concurrent users.
