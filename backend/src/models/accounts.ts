import { AccountClassification, AccountType } from "../types";

import { DEFAULTS } from "../constants";
import Joi from "joi";

export const registerAccountBodySchema = Joi.object({
  accountId: Joi.string()
    .length(DEFAULTS.ACCOUNT_ID_LENGTH)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "AWS Account ID must be exactly 12 digits",
      "string.pattern.base": "AWS Account ID must contain only digits",
    }),
  accountName: Joi.string()
    .min(DEFAULTS.MIN_ACCOUNT_NAME_LENGTH)
    .max(128)
    .required(),
  email: Joi.string().email().required(),
  description: Joi.string()
    .min(DEFAULTS.MIN_DESCRIPTION_LENGTH)
    .max(500)
    .required(),
  accountType: Joi.string()
    .valid(...Object.values(AccountType))
    .required(),
  classification: Joi.string()
    .valid(...Object.values(AccountClassification))
    .required(),
  dataSensitivity: Joi.object({
    customerData: Joi.boolean().required(),
    customerMetadata: Joi.boolean().required(),
    businessData: Joi.boolean().required(),
  }).required(),
  groupId: Joi.string().uuid().optional(),
  tags: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export const updateAccountBodySchema = Joi.object({
  accountName: Joi.string()
    .min(DEFAULTS.MIN_ACCOUNT_NAME_LENGTH)
    .max(128)
    .optional(),
  email: Joi.string().email().optional(),
  description: Joi.string()
    .min(DEFAULTS.MIN_DESCRIPTION_LENGTH)
    .max(500)
    .optional(),
  accountType: Joi.string()
    .valid(...Object.values(AccountType))
    .optional(),
  classification: Joi.string()
    .valid(...Object.values(AccountClassification))
    .optional(),
  dataSensitivity: Joi.object({
    customerData: Joi.boolean().required(),
    customerMetadata: Joi.boolean().required(),
    businessData: Joi.boolean().required(),
  }).optional(),
  groupId: Joi.string().uuid().allow(null).optional(),
  tags: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
}).min(1);

export const accountParamsSchema = Joi.object({
  accountId: Joi.string()
    .length(DEFAULTS.ACCOUNT_ID_LENGTH)
    .pattern(/^\d+$/)
    .required(),
});

export const listAccountsQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(DEFAULTS.MAX_PAGINATION_LIMIT)
    .optional(),
  nextToken: Joi.string().optional(),
  classification: Joi.string()
    .valid(...Object.values(AccountClassification))
    .optional(),
  status: Joi.string().valid("ACTIVE", "SUSPENDED").optional(),
  groupId: Joi.string().uuid().optional(),
  search: Joi.string().max(128).optional(),
});

export const updateClassificationBodySchema = Joi.object({
  classification: Joi.string()
    .valid(...Object.values(AccountClassification))
    .required(),
  dataSensitivity: Joi.object({
    customerData: Joi.boolean().required(),
    customerMetadata: Joi.boolean().required(),
    businessData: Joi.boolean().required(),
  }).required(),
});

export const updateOwnershipBodySchema = Joi.object({
  primaryOwnerId: Joi.string().uuid().optional(),
  secondaryOwnerIds: Joi.array().items(Joi.string().uuid()).min(1).optional(),
  groupOwnerId: Joi.string().uuid().allow(null).optional(),
}).min(1);
