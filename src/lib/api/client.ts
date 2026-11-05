import axios, { type AxiosAdapter } from "axios";

import { ApiError, normalizeApiError } from "./api-error";
import { endpoints } from "./endpoints";

//--------api-env----//
const mode = process.env.NEXT_PUBLIC_API_MODE;
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (mode !== "mock" && mode !== "python") {
  throw new Error("Set NEXT_PUBLIC_API_MODE in .env to mock or python.");
}

if (!baseURL || !/^https?:\/\//.test(baseURL)) {
  throw new Error("Set NEXT_PUBLIC_API_URL in .env to an absolute http(s) URL.");
}

export const isMockApi = mode === "mock";
//-------end-api-env----//
const accessTokenKey = "manisa_access_token";

let accessToken: string | null | undefined;

export function getAccessToken() {
  if (accessToken !== undefined) return accessToken;
  if (typeof window === "undefined") return null;
  try {
    accessToken = window.sessionStorage.getItem(accessTokenKey);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(accessTokenKey, token);
  } catch {
    // Keep the token in memory when browser storage is unavailable.
  }
}

export function clearAccessToken() {
  accessToken = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(accessTokenKey);
  } catch {
    // The in-memory token has still been cleared.
  }
}

// Loaded only when mock mode is explicitly selected (or during local development).
const mockAdapter: AxiosAdapter = async (config) => {
  const { accessMockAdapter } = await import("@/mocks/access/adapter");
  return accessMockAdapter(config);
};

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  ...(isMockApi ? { adapter: mockAdapter } : {}),
});

// Validate and modify request configuration before sending it.
apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") throw new ApiError("API requests are browser-only.", 0);
  const token = getAccessToken();
  if (!isMockApi && token && config.url !== endpoints.authV1.login) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Intercept API responses to process successful results or handle errors.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalizedError = normalizeApiError(error);
    if (normalizedError instanceof ApiError && normalizedError.status === 401) clearAccessToken();
    return Promise.reject(normalizedError);
  },
);
