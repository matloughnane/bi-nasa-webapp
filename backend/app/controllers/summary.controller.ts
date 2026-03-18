import type { Request, Response } from "express";
import logger from "../../utils/logger.js";
import { UpstreamError } from "../services/errors.js";
import { getSummary } from "../services/summary.service.js";

export async function postSummary(req: Request, res: Response) {
  const type = req.params.type as "neo" | "flr";
  const { start_date, end_date, question } = req.body;

  try {
    const text = await getSummary(type, start_date, end_date, question);
    res.json({
      status: "ok",
      message: "Summary generated",
      data: { summary: text },
    });
  } catch (err) {
    if (err instanceof UpstreamError) {
      res
        .status(err.statusCode)
        .json({
          status: "error",
          message: "Upstream NASA API error",
          data: null,
        });
    } else {
      logger.error("Summary generation failed", err);
      res
        .status(502)
        .json({
          status: "error",
          message: "Failed to generate summary",
          data: null,
        });
    }
  }
}
