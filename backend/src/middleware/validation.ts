import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "../constants";
import { Schema } from "joi";

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation error",
        details: error.details[0].message,
      });
      return;
    }
    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation error",
        details: error.details[0].message,
      });
      return;
    }
    next();
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation error",
        details: error.details[0].message,
      });
      return;
    }
    next();
  };
};
