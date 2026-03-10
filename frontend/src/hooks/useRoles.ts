import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "../services/apiClient";
import { queryClient } from "./useQueryConfig";

const ROLES_QUERY_KEY = "roles";

interface Role {
  roleId: string;
  roleName: string;
  roleType: string;
  description: string;
  policyArns: string[];
  allowedUsers: string[];
  allowedGroups: string[];
  sessionTimeout: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateRoleParams {
  roleName: string;
  roleType: string;
  description: string;
  policyArns: string[];
  allowedUsers?: string[];
  allowedGroups?: string[];
  sessionTimeout?: number;
}

export const useRoles = (accountId: string, options = {}) => {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, accountId],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Role[] }>(
        `/accounts/${accountId}/roles`
      );
      return response;
    },
    enabled: !!accountId,
    ...options,
  });
};

export const useCreateRole = (accountId: string, options = {}) => {
  return useMutation({
    mutationFn: async (params: CreateRoleParams) => {
      const response = await apiClient.post<{
        roleId: string;
        roleName: string;
        roleArn: string;
        message: string;
      }>(`/accounts/${accountId}/roles`, params);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLES_QUERY_KEY, accountId],
      });
    },
    ...options,
  });
};

export const useDeleteRole = (accountId: string, options = {}) => {
  return useMutation({
    mutationFn: async (roleId: string) => {
      const response = await apiClient.delete<{
        roleId: string;
        message: string;
      }>(`/accounts/${accountId}/roles/${roleId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLES_QUERY_KEY, accountId],
      });
    },
    ...options,
  });
};

export const useAuditHistory = (accountId: string, options = {}) => {
  return useQuery({
    queryKey: ["audit", accountId],
    queryFn: async () => {
      const response = await apiClient.get<{
        items: {
          auditId: string;
          action: string;
          actorId: string;
          actorEmail: string;
          accountId: string;
          resourceType: string;
          resourceId: string;
          details?: Record<string, unknown>;
          timestamp: string;
        }[];
      }>(`/accounts/${accountId}/history`);
      return response;
    },
    enabled: !!accountId,
    ...options,
  });
};
