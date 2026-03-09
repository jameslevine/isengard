import { Request, Response } from "express";

import { getHealth } from "../../controllers/health";

describe("Health Controller", () => {
  it("should return healthy status with timestamp", () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "healthy",
        timestamp: expect.any(String),
      })
    );
  });

  it("should return a valid ISO timestamp", () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    getHealth(req, res);

    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    const timestamp = new Date(jsonCall.timestamp);
    expect(timestamp.toISOString()).toBe(jsonCall.timestamp);
  });
});
