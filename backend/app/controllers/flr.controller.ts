import type { Request, Response } from "express";
import logger from "../../utils/logger.js";
import { UpstreamError } from "../services/errors.js";
import { fetchFlr } from "../services/flr.service.js";

export async function getFlr(req: Request, res: Response) {
  const { start_date, end_date, page = "1", page_size = "10" } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const pageSizeNum = Math.max(1, Math.min(100, parseInt(page_size as string, 10)));

  try {
    const data = await fetchFlr(start_date as string, end_date as string);
    const offset = (pageNum - 1) * pageSizeNum;
    res.json({ status: "ok", message: "Solar flare data retrieved successfully", data: { data: data.slice(offset, offset + pageSizeNum), total: data.length } });
  } catch (err) {
    if (err instanceof UpstreamError) {
      res.status(err.statusCode).json({ status: "error", message: "Upstream NASA API error", data: null });
    } else {
      logger.error("FLR fetch failed", err);
      res.status(502).json({ status: "error", message: "Failed to fetch from NASA API", data: null });
    }
  }
}
