import { Request, Response, NextFunction } from "express";
import env from "../lib/env";

export const apiMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Retrieve the API key from cookies
  const studioKey = req.headers["x-studio-key"];

  if (!studioKey) {
    res.status(401).json({
      message: "Not Authorized. Studio key is missing.",
    });
    return;
  }

  if (studioKey !== env.STUDIO_API_KEY) {
    res.status(401).json({
      message: "Invalid Studio API key.",
    });
    return;
  }

  // If the key matches, proceed to the next middleware or handler
  next();
};
