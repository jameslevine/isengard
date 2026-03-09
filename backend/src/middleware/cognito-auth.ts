import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../types";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export const cognitoAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const payload = await verifier.verify(token);
    req.user = {
      sub: payload.sub,
      email: (payload as Record<string, unknown>).email as string,
      "cognito:username": (payload as Record<string, unknown>)[
        "cognito:username"
      ] as string,
      "custom:orgId": (payload as Record<string, unknown>)[
        "custom:orgId"
      ] as string,
      token_use: payload.token_use,
      auth_time: payload.auth_time as number,
      iss: payload.iss,
      exp: payload.exp,
      iat: payload.iat,
    };
    next();
  } catch (_err) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
};
