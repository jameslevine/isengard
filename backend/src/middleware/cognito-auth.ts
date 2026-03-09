import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../types";
import { CognitoJwtVerifier } from "aws-jwt-verify";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

const getVerifier = () => {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      tokenUse: "access",
      clientId: process.env.COGNITO_CLIENT_ID!,
    });
  }
  return verifier;
};

export const cognitoAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip auth in development if no Cognito config
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.COGNITO_USER_POOL_ID?.startsWith("eu-") &&
    !process.env.COGNITO_USER_POOL_ID?.startsWith("us-") &&
    !process.env.COGNITO_USER_POOL_ID?.startsWith("ap-")
  ) {
    req.user = {
      sub: "dev-user-id",
      email: "dev@isengard.local",
      "cognito:username": "dev-user",
      "custom:orgId": "dev-org",
      token_use: "access",
      auth_time: Date.now(),
      iss: "development",
      exp: Date.now() + 3600000,
      iat: Date.now(),
    };
    next();
    return;
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const payload = await getVerifier().verify(token);
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
