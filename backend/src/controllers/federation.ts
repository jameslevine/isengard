import {
  CONTROL_ROLE,
  ERROR_MESSAGES,
  FEDERATION,
  HTTP_STATUS,
} from "../constants";

import { AssumeRoleCommand } from "@aws-sdk/client-sts";
import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import { getDbAccountById } from "../adapters/accounts";
import { stsClient } from "../lib/sts";

const getConsoleUrl = async (
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  },
  destination?: string
): Promise<string> => {
  const sessionJson = JSON.stringify({
    sessionId: credentials.accessKeyId,
    sessionKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
  });

  // Get signin token
  const signinTokenUrl =
    `${FEDERATION.SIGNIN_URL}?Action=getSigninToken` +
    `&SessionDuration=3600` +
    `&Session=${encodeURIComponent(sessionJson)}`;

  const tokenResponse = await fetch(signinTokenUrl);
  const tokenData = (await tokenResponse.json()) as {
    SigninToken: string;
  };

  // Build console login URL
  const consoleDestination = destination
    ? `${FEDERATION.CONSOLE_URL}${destination}`
    : FEDERATION.CONSOLE_URL;

  const loginUrl =
    `${FEDERATION.SIGNIN_URL}?Action=login` +
    `&Issuer=${FEDERATION.ISSUER}` +
    `&Destination=${encodeURIComponent(consoleDestination)}` +
    `&SigninToken=${tokenData.SigninToken}`;

  return loginUrl;
};

export const federateToConsole = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;
    const roleId = req.params.roleId as string;
    const { destination, sessionDuration } = req.body || {};

    // Get account details
    const account = await getDbAccountById(orgId, accountId);
    if (!account) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    if (account.controlRoleStatus !== "ACTIVE") {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: ERROR_MESSAGES.CONTROL_ROLE_NOT_ACTIVE });
      return;
    }

    // Step 1: Assume the control role
    const controlRoleArn =
      account.controlRoleArn ||
      `arn:aws:iam::${accountId}:role/${CONTROL_ROLE.NAME}`;

    const controlCreds = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: controlRoleArn,
        RoleSessionName: `${req.user.sub}-isengard`,
        ExternalId: account.externalId,
        DurationSeconds: sessionDuration || 3600,
      })
    );

    if (!controlCreds.Credentials) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to assume control role" });
      return;
    }

    // Step 2: Use control role creds to assume target role
    const targetRoleArn = `arn:aws:iam::${accountId}:role/${roleId}`;
    const targetStsClient = stsClient; // In production, create new client with control creds

    const targetCreds = await targetStsClient.send(
      new AssumeRoleCommand({
        RoleArn: targetRoleArn,
        RoleSessionName: `${req.user.sub}-isengard`,
        DurationSeconds: sessionDuration || 3600,
      })
    );

    if (!targetCreds.Credentials) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to assume target role" });
      return;
    }

    // Step 3: Generate federation URL
    const federationUrl = await getConsoleUrl(
      {
        accessKeyId: targetCreds.Credentials.AccessKeyId!,
        secretAccessKey: targetCreds.Credentials.SecretAccessKey!,
        sessionToken: targetCreds.Credentials.SessionToken!,
      },
      destination
    );

    res.status(HTTP_STATUS.OK).json({
      federationUrl,
      expiresAt: targetCreds.Credentials.Expiration?.toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error federating to console:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to federate to console" });
  }
};

export const getTemporaryCredentials = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;
    const roleId = req.params.roleId as string;
    const { sessionDuration } = req.body || {};

    const account = await getDbAccountById(orgId, accountId);
    if (!account) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    if (account.controlRoleStatus !== "ACTIVE") {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: ERROR_MESSAGES.CONTROL_ROLE_NOT_ACTIVE });
      return;
    }

    // Assume control role then target role
    const controlRoleArn =
      account.controlRoleArn ||
      `arn:aws:iam::${accountId}:role/${CONTROL_ROLE.NAME}`;

    const controlCreds = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: controlRoleArn,
        RoleSessionName: `${req.user.sub}-isengard`,
        ExternalId: account.externalId,
        DurationSeconds: sessionDuration || 3600,
      })
    );

    if (!controlCreds.Credentials) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to assume control role" });
      return;
    }

    const targetRoleArn = `arn:aws:iam::${accountId}:role/${roleId}`;

    const targetCreds = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: targetRoleArn,
        RoleSessionName: `${req.user.sub}-isengard`,
        DurationSeconds: sessionDuration || 3600,
      })
    );

    if (!targetCreds.Credentials) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to assume target role" });
      return;
    }

    const creds = {
      accessKeyId: targetCreds.Credentials.AccessKeyId!,
      secretAccessKey: targetCreds.Credentials.SecretAccessKey!,
      sessionToken: targetCreds.Credentials.SessionToken!,
      expiration: targetCreds.Credentials.Expiration?.toISOString(),
    };

    res.status(HTTP_STATUS.OK).json({
      credentials: creds,
      accountId,
      roleName: roleId,
      environment: {
        bash: [
          `export AWS_ACCESS_KEY_ID="${creds.accessKeyId}"`,
          `export AWS_SECRET_ACCESS_KEY="${creds.secretAccessKey}"`,
          `export AWS_SESSION_TOKEN="${creds.sessionToken}"`,
        ].join("\n"),
        powershell: [
          `$env:AWS_ACCESS_KEY_ID="${creds.accessKeyId}"`,
          `$env:AWS_SECRET_ACCESS_KEY="${creds.secretAccessKey}"`,
          `$env:AWS_SESSION_TOKEN="${creds.sessionToken}"`,
        ].join("\n"),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting temporary credentials:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to get temporary credentials" });
  }
};
