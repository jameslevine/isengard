import { DEFAULTS } from "../constants";
import Joi from "joi";
import { RoleType } from "../types";

export const createRoleBodySchema = Joi.object({
  roleName: Joi.string()
    .pattern(/^[a-zA-Z0-9-_]+$/)
    .max(64)
    .required(),
  roleType: Joi.string()
    .valid(...Object.values(RoleType))
    .required(),
  description: Joi.string().min(10).max(500).required(),
  policyArns: Joi.array()
    .items(Joi.string().pattern(/^arn:aws/))
    .min(1)
    .required(),
  allowedUsers: Joi.array().items(Joi.string()).optional(),
  allowedGroups: Joi.array().items(Joi.string()).optional(),
  sessionTimeout: Joi.number()
    .integer()
    .min(DEFAULTS.MIN_SESSION_TIMEOUT)
    .max(DEFAULTS.MAX_SESSION_TIMEOUT)
    .optional(),
});

export const updateRoleBodySchema = Joi.object({
  description: Joi.string().min(10).max(500).optional(),
  policyArns: Joi.array()
    .items(Joi.string().pattern(/^arn:aws/))
    .min(1)
    .optional(),
  allowedUsers: Joi.array().items(Joi.string()).optional(),
  allowedGroups: Joi.array().items(Joi.string()).optional(),
  sessionTimeout: Joi.number()
    .integer()
    .min(DEFAULTS.MIN_SESSION_TIMEOUT)
    .max(DEFAULTS.MAX_SESSION_TIMEOUT)
    .optional(),
}).min(1);

export const roleParamsSchema = Joi.object({
  accountId: Joi.string()
    .length(DEFAULTS.ACCOUNT_ID_LENGTH)
    .pattern(/^\d+$/)
    .required(),
  roleId: Joi.string().required(),
});
