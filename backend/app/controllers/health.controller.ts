import type { Request, Response } from "express";

export function healthCheck(_req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    message: "Service is healthy",
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
}
