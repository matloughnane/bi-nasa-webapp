import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "development";
const nasaApiKey = process.env.NASA_API_KEY || "DEMO_KEY";
const geminiApiKey = process.env.GEMINI_API_KEY || "";

if (env === "production" && (!process.env.NASA_API_KEY || nasaApiKey === "DEMO_KEY")) {
  throw new Error("NASA_API_KEY must be set to a real key in production");
}

if (env === "production" && !geminiApiKey) {
  throw new Error("GEMINI_API_KEY must be set in production");
}

export const config = {
  env,
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
  nasa: {
    apiKey: nasaApiKey,
    baseUrl: "https://api.nasa.gov",
    fetchHeaders: { "Accept-Encoding": "gzip, deflate, br" } as Record<string, string>,
  },
  gemini: {
    apiKey: geminiApiKey,
    model: "gemini-2.5-flash",
  },
};
