import Cookies from "js-cookie";

export const API_BASE_URL = "http://localhost:3001";

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = Cookies.get("token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/refresh"
  ) {
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          Cookies.set("token", newTokens.access_token, {
            secure: true,
            sameSite: "strict",
          });
          Cookies.set("refreshToken", newTokens.refresh_token, {
            secure: true,
            sameSite: "strict",
          });

          headers.set("Authorization", `Bearer ${newTokens.access_token}`);
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }
  }

  // Global Auth Middleware: If we are still 401 (meaning we couldn't refresh or had no token)
  if (
    response.status === 401 &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/register"
  ) {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorMessage = "API Request Failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    return text as unknown as T;
  }
}

/**
 * Standardized API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Typed CRUD Api Client wrapping the core fetch block.
 * Gracefully handles success/error boolean states to avoid raw try/catch blocks.
 * Supports Generic response typings and Body input typings natively.
 */
export const apiClient = {
  get: async <TResponse>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<TResponse>> => {
    try {
      const data = await fetchApi<TResponse>(endpoint, {
        ...options,
        method: "GET",
      });
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  post: async <TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestInit,
  ): Promise<ApiResponse<TResponse>> => {
    try {
      const data = await fetchApi<TResponse>(endpoint, {
        ...options,
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  put: async <TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: RequestInit,
  ): Promise<ApiResponse<TResponse>> => {
    try {
      const data = await fetchApi<TResponse>(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(body),
      });
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  patch: async <TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: RequestInit,
  ): Promise<ApiResponse<TResponse>> => {
    try {
      const data = await fetchApi<TResponse>(endpoint, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  delete: async <TResponse = any>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<TResponse>> => {
    try {
      const data = await fetchApi<TResponse>(endpoint, {
        ...options,
        method: "DELETE",
      });
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },
};
