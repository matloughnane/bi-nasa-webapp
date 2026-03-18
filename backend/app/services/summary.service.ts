import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { config } from "../../config/index.js";
import { AppCache } from "../../utils/cache.js";
import { fetchNeo } from "./neo.service.js";
import { fetchFlr } from "./flr.service.js";

const cache = new AppCache<string>("Summary");

export async function getSummary(
  type: "neo" | "flr",
  startDate: string,
  endDate: string,
  question?: string,
): Promise<string> {
  const cacheKey = `${type}:${startDate}:${endDate}:${question ?? ""}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = type === "neo"
    ? await fetchNeo(startDate, endDate)
    : await fetchFlr(startDate, endDate);

  const dataJson = JSON.stringify(data, null, 2);

  const prompt = [
    `You are an expert NASA data analyst. Below is ${type === "neo" ? "Near Earth Object" : "Solar Flare"} data from NASA's API for the period ${startDate} to ${endDate}.`,
    "",
    "DATA:",
    dataJson,
    "",
    question ? `USER QUESTION: ${question}` : "Please provide a concise summary of this data, highlighting key trends and notable entries.",
    "",
    "IMPORTANT: Jump straight into the answer. Never start with a preamble like \"As an expert NASA data analyst\" or introduce yourself.",
  ].join("\n");

  const { text } = await generateText({
    model: createGoogleGenerativeAI({ apiKey: config.gemini.apiKey })(config.gemini.model),
    prompt,
  });

  cache.set(cacheKey, text);
  return text;
}
