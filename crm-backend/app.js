import dotenv from "dotenv";
dotenv.config();  

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import routes from "./src/routes/index.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cors());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", globalLimiter);

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.status(200).send("Sales CRM running successfully");
});

app.use(errorMiddleware);

export default app;

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import rateLimit from "express-rate-limit";

// import routes from "./src/routes/index.js";
// import { errorMiddleware } from "./src/middlewares/error.middleware.js";

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cors());

// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again later.",
//   },
// });

// app.use("/api", globalLimiter);

// app.use("/api", routes);

// app.get("/health", (req, res) => {
//   res.status(200).send("Sales CRM running successfully");
// });

// app.use(errorMiddleware);

// export default app;
