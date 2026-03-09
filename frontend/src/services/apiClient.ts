const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";

interface RequestOptions {
  headers?: Record<string, string>;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw JSON.stringify(error);
  }
  return response.json();
};

export const apiClient = {
  get: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
