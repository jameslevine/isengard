import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "../services/apiClient";
import { queryClient } from "./useQueryConfig";

const ACCOUNTS_QUERY_KEY = "accounts";

interface Account {
  accountId: string;
  accountName: string;
  email: string;
  description: string;
  accountType: string;
  classification: string;
  dataSensitivity: {
    customerData: boolean;
    customerMetadata: boolean;
    businessData: boolean;
  };
  primaryOwnerId: string;
  secondaryOwnerIds: string[];
  groupOwnerId?: string;
  controlRoleStatus: string;
  status: string;
  groupId?: string;
  tags?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedAccounts {
  items: Account[];
  nextToken?: string;
}

interface RegisterAccountParams {
  accountId: string;
  accountName: string;
  email: string;
  description: string;
  accountType: string;
  classification: string;
  dataSensitivity: {
    customerData: boolean;
    customerMetadata: boolean;
    businessData: boolean;
  };
  groupId?: string;
}

export const useAccounts = (options = {}) => {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedAccounts>("/accounts");
      return response;
    },
    ...options,
  });
};

export const useAccount = (accountId: string, options = {}) => {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, accountId],
    queryFn: async () => {
      const response = await apiClient.get<Account>(`/accounts/${accountId}`);
      return response;
    },
    enabled: !!accountId,
    ...options,
  });
};

export const useRegisterAccount = (options = {}) => {
  return useMutation({
    mutationFn: async (params: RegisterAccountParams) => {
      const response = await apiClient.post<{
        accountId: string;
        accountName: string;
        controlRoleStatus: string;
        status: string;
        message: string;
      }>("/accounts", params);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY],
      });
    },
    ...options,
  });
};

export const useUpdateAccount = (accountId: string, options = {}) => {
  return useMutation({
    mutationFn: async (
      params: Partial<
        Pick<Account, "accountName" | "email" | "description" | "tags">
      >
    ) => {
      const response = await apiClient.patch<{
        accountId: string;
        message: string;
      }>(`/accounts/${accountId}`, params);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY, accountId],
      });
    },
    ...options,
  });
};

export const useDashboardSummary = (options = {}) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      // For now, derive from accounts list
      const accounts = await apiClient.get<PaginatedAccounts>("/accounts");
      const total = accounts.items.length;
      const production = accounts.items.filter(
        (a) => a.classification === "PRODUCTION"
      ).length;
      return {
        accounts: {
          total,
          production,
          nonProduction: total - production,
          active: accounts.items.filter((a) => a.status === "ACTIVE").length,
        },
      };
    },
    ...options,
  });
};
