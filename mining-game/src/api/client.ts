// src/api/client.ts
//
// Thin fetch wrapper used by every backend call. Two things it exists for:
//  1. Attach the Descope session token as a Bearer header automatically.
//  2. Let callers tell the difference between "server rejected this"
//     (ApiError - e.g. insufficient balance) and "request never reached the
//     server" (NetworkError - offline/dropped connection), since the store
//     handles those two cases very differently (roll back vs. queue+retry).
//
// The token itself is NOT read via the SDK's standalone getSessionToken()
// function - that reads from a module-level singleton inside the SDK that
// can end up out of sync with the actual mounted AuthProvider (e.g. under
// React StrictMode's double-mount in dev). Instead, setAuthToken() is called
// from a hook wired to useSession().sessionToken, which is the
// context-backed value guaranteed to match the real, mounted provider.

const rawUrl = import.meta.env.VITE_API_URL as string | undefined;
// Remove trailing slashes if present
const API_BASE_URL = rawUrl ? rawUrl.replace(/\/+$/, "") : undefined;

let currentToken: string | null = null;

// Call this whenever useSession().sessionToken changes - see
// hooks/useSyncAuthToken.ts.
export function setAuthToken(token: string | null) {
  currentToken = token;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = "Could not reach the server.") {
    super(message);
    this.name = "NetworkError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_URL is not set - point it at the backend");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    // fetch() only throws on network-level failures (offline, DNS, CORS
    // preflight rejection) - anything the server actually responded to
    // (including 4xx/5xx) lands in the try block below instead.
    throw new NetworkError();
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(response.status, text || response.statusText);
  }

  const text = await response.text();
  // Some endpoints (rare) may return no body.
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      response.status,
      `Server returned invalid JSON response: ${text.substring(0, 100)}`,
    );
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
