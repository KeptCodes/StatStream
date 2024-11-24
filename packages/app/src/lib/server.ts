import express from "express";
import cors from "cors";
import { router, apiRoutes } from "../api/routes";
import { apiMiddleware } from "../api/middleware";

const server = express();
server.disable("x-powered-by");
server.use(cors());
server.use(express.json());

server.use(router);

// API KEY secured routes
server.use("/api", apiMiddleware, apiRoutes);

server.use((_, res) => {
  res.send("NOT FOUND");
});

export default server;
