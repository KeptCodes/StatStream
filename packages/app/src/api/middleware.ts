import { Request, Response, NextFunction } from "express";
import env from "../lib/env";

export const apiMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apikey = req.headers["x-studio-key"];

  if (!apikey) {
    res.status(401).json({
      message: "Not Authorized.",
    });
    return;
  }
  if (apikey !== env.STUDIO_API_KEY) {
    res.status(401).json({
      message: "Invalid Studio API key.",
    });
    return;
  }

  next();
};
