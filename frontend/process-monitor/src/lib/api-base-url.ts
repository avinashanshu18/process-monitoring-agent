function fallbackApiOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(":3001", ":8001");
  }
  return "http://127.0.0.1:8001";
}

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  return `${fallbackApiOrigin()}/api/v1`;
}
