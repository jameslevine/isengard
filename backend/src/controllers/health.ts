import { Request, Response } from "express";

import { HTTP_STATUS } from "../constants";

export const getHealth = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
};
