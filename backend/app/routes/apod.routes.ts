import { Router } from "express";
import { getApod } from "../controllers/apod.controller.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router: Router = Router();

const apodQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format")
    .optional(),
});

router.get("/", validate(apodQuerySchema, "query"), getApod);

export default router;
