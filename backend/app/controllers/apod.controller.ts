import type { Request, Response } from "express";
import logger from "../../utils/logger.js";
import { UpstreamError } from "../services/errors.js";
import { fetchApod } from "../services/apod.service.js";

export async function getApod(req: Request, res: Response) {
  const { date } = req.query;

  try {
    const data = await fetchApod(typeof date === "string" ? date : undefined);
    res.json({ status: "ok", message: "APOD data retrieved successfully", data });
  } catch (err) {
    if (err instanceof UpstreamError) {
      logger.error("APOD fetch failed", err);
      res.status(err.statusCode).json({ status: "error", message: "Upstream NASA API error", data: null });
    } else {
      logger.error("APOD fetch failed", err);
      res.status(502).json({ status: "error", message: "Failed to fetch from NASA API", data: null });
    }
  }
}
