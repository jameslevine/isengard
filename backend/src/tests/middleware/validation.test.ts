import { NextFunction, Request, Response } from "express";
import { validateBody, validateParams } from "../../middleware/validation";

import Joi from "joi";

describe("Validation Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("validateBody", () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    it("should call next() when body is valid", () => {
      mockReq.body = { name: "Test", email: "test@example.com" };

      validateBody(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 400 when body is invalid", () => {
      mockReq.body = { name: "" };

      validateBody(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation error",
          details: expect.any(String),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when required field is missing", () => {
      mockReq.body = { name: "Test" };

      validateBody(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateParams", () => {
    const schema = Joi.object({
      accountId: Joi.string().length(12).pattern(/^\d+$/).required(),
    });

    it("should call next() when params are valid", () => {
      mockReq.params = { accountId: "123456789012" };

      validateParams(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 400 when accountId is wrong length", () => {
      mockReq.params = { accountId: "12345" };

      validateParams(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when accountId has non-digits", () => {
      mockReq.params = { accountId: "12345678901a" };

      validateParams(schema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
