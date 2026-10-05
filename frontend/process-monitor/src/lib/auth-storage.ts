export const ACCESS_TOKEN_KEY = "hostlens.access-token";
export const REFRESH_TOKEN_KEY = "hostlens.refresh-token";

export function loadStoredToken(key: string) {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(key) ?? "";
}

export function storeTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return loadStoredToken(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return loadStoredToken(REFRESH_TOKEN_KEY);
}
