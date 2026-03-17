import express from "express";
import helmet from "helmet";
import { config } from "./config/index";
import { rateLimiter } from "./app/middleware/rateLimiter";
import routes from "./app/routes/index";
import logger from "./utils/logger";

const app = express();

app.use(helmet());
app.use(rateLimiter);
app.use(express.json());

app.use("/", routes);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.env}]`);
});
