import { Router } from "express";
import healthRoutes from "./health.routes";
import apodRoutes from "./apod.routes";
import neoRoutes from "./neo.routes";
import flrRoutes from "./flr.routes";

const router: Router = Router();

// BASE
router.get("/", (_req, res) => {
  res.status(200).json({ title: "NASA API" });
});
// HEALTH
router.use("/health", healthRoutes);
// NASA APOD
router.use("/apod", apodRoutes);
// NASA NEO
router.use("/neo", neoRoutes);
// NASA DONKI Solar Flares
router.use("/flr", flrRoutes);

export default router;
