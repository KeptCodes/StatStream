import express from "express";
import cors from "cors";
import router from "../api/routes";

const server = express();

server.use(cors());
server.use(express.json());
server.use(router);
server.use((req, res, next) => {
  res.send("NOT FOUND");
});

export default server;
