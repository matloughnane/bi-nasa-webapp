import { Router } from "express";
import healthRoutes from "./health.routes";
import apodRoutes from "./apod.routes";
import neoRoutes from "./neo.routes";
import flrRoutes from "./flr.routes";
import summaryRoutes from "./summary.routes";

const router: Router = Router();

// BASE
router.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "NASA API", data: null });
});
// HEALTH
router.use("/health", healthRoutes);
// NASA APOD
router.use("/apod", apodRoutes);
// NASA NEO
router.use("/neo", neoRoutes);
// NASA DONKI Solar Flares
router.use("/flr", flrRoutes);
// AI Summary (Gemini)
router.use("/summary", summaryRoutes);

export default router;
