### YOUR PRACTICE TASK: ✍️

Now you will assemble `src/db/index.js` and `src/index.js`.

#### Requirements:

1. **`src/db/index.js`**:

    - Combine the `sqlite3` connection setup with your clean `schema` definition and `initSchema` function we built earlier.
    - Export a main `connectDB` function that:
        1. Connects to SQLite (`DB_NAME`).
        2. Runs `PRAGMA foreign_keys = ON;`.
        3. Runs `initSchema(db)` to ensure all 5 tables (`users`, `events`, `ticket_tiers`, `bookings`, `checkins`) exist.
        4. Resolves with the `db` instance if everything succeeds.
    - Export a helper function `getDB()` so model files can access the database connection.
2. **`src/index.js`**:

    - Load `dotenv` variables (`dotenv.config({ path: "./.env" })`).
    - Import `app` from `./app.js`.
    - Import `connectDB` from `./db/index.js`.
    - Call `connectDB()`.
    - On `.then()`, start listening with `app.listen(process.env.PORT || 8000, ...)` and log the server URL.
    - On `.catch()`, log the error and stop execution.

**Paste your code for both `src/db/index.js` and `src/index.js` below.**

Once verified, test running `npm run dev` or `node src/index.js` to see your database initialize and server start! Then we dive into **Step 4: User Authentication & JWT Token Engine**! 🚀