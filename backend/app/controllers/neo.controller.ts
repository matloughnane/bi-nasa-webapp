import type { Request, Response } from "express";
import logger from "../../utils/logger.js";
import { UpstreamError } from "../services/errors.js";
import { fetchNeo } from "../services/neo.service.js";

export async function getNeo(req: Request, res: Response) {
  const { start_date, end_date, page, page_size } = req.query;
  const paginate = page !== undefined && page_size !== undefined;
  const pageNum = paginate ? Math.max(1, parseInt(page as string, 10)) : 1;
  const pageSizeNum = paginate
    ? Math.max(1, Math.min(100, parseInt(page_size as string, 10)))
    : 0;

  try {
    const data = await fetchNeo(start_date as string, end_date as string);

    if (paginate) {
      const offset = (pageNum - 1) * pageSizeNum;
      res.json({
        status: "ok",
        message: "NEO data retrieved successfully",
        data: {
          data: data.slice(offset, offset + pageSizeNum),
          total: data.length,
        },
      });
    } else {
      res.json({
        status: "ok",
        message: "NEO data retrieved successfully",
        data: { data, total: data.length },
      });
    }
  } catch (err) {
    if (err instanceof UpstreamError) {
      logger.error("NEO fetch failed", err);
      res
        .status(err.statusCode)
        .json({
          status: "error",
          message: "Upstream NASA API error",
          data: null,
        });
    } else {
      logger.error("NEO fetch failed", err);
      res
        .status(502)
        .json({
          status: "error",
          message: "Failed to fetch from NASA API",
          data: null,
        });
    }
  }
}
