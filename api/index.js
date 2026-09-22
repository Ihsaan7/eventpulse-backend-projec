import app from "../src/app.js";
import { connectDB } from "../src/db/index.js";

let isReady = false;
let initPromise = null;

const ensureReady = async () => {
  if (isReady) return;
  if (!initPromise) {
    initPromise = connectDB()
      .then(() => {
        isReady = true;
      })
      .catch((err) => {
        console.error("Vercel Serverless Database Connection Error:", err);
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
};

export default async function handler(req, res) {
  try {
    await ensureReady();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Handler Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server initialization error: " + error.message,
    });
  }
}
