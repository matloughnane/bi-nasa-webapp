import { Router } from "express";
import { getFlr } from "../controllers/flr.controller.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router: Router = Router();

const flrQuerySchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be YYYY-MM-DD format"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be YYYY-MM-DD format"),
    page: z.string().regex(/^\d+$/).optional(),
    page_size: z.string().regex(/^\d+$/).optional(),
  })
  .strict();

router.get("/", validate(flrQuerySchema, "query"), getFlr);

export default router;
