import express from "express";
import cors from "cors";
import { router, apiRoutes } from "../api/routes";
import { apiMiddleware } from "../api/middleware";
import cookieParser from "cookie-parser";
const allowedOrigins = [
  "http://localhost:3000",
  "https://statstream.vercel.app",
];

const server = express();
server.disable("x-powered-by");
server.use(cookieParser());
server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
server.use(express.json());

server.use(router);

// API KEY secured routes
server.use("/api", apiMiddleware, apiRoutes);

server.use((_, res) => {
  res.send("NOT FOUND");
});

export default server;
