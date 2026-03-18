import { Router } from "express";
import { postSummary } from "../controllers/summary.controller.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router: Router = Router();

const summaryParamsSchema = z.object({
  type: z.enum(["neo", "flr"]),
});

const summaryBodySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be YYYY-MM-DD format"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be YYYY-MM-DD format"),
  question: z.string().max(500).optional(),
});

router.post(
  "/:type",
  validate(summaryParamsSchema, "params"),
  validate(summaryBodySchema, "body"),
  postSummary,
);

export default router;
