import { Router } from "express";
import { getNeo } from "../controllers/neo.controller.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router: Router = Router();

const neoQuerySchema = z
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

router.get("/", validate(neoQuerySchema, "query"), getNeo);

export default router;
