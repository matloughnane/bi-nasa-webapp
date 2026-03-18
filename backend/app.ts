import compression from "compression";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { config } from "./config/index";
import { rateLimiter } from "./app/middleware/rateLimiter";
import routes from "./app/routes/index";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin.split(",") }));
app.use(compression());
app.use(rateLimiter);
app.use(express.json({ limit: "1kb" }));

app.use("/", routes);

export default app;
