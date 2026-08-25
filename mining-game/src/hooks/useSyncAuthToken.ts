// src/hooks/useSyncAuthToken.ts
//
// useSession().sessionToken is the context-backed token that's guaranteed
// to match the actual mounted Descope AuthProvider - unlike the SDK's
// standalone getSessionToken() function, which reads a module-level
// singleton that can drift out of sync (notably under React StrictMode's
// double-mount in dev). Mount this once near the root of the app.

import { useEffect } from "react";
import { useSession } from "@descope/react-sdk";
import { setAuthToken } from "../api/client";

export function useSyncAuthToken() {
  const { sessionToken, isAuthenticated } = useSession();

  useEffect(() => {
    console.log("[useSyncAuthToken]", {
      isAuthenticated,
      hasToken: !!sessionToken,
      tokenPreview: sessionToken ? `${sessionToken.slice(0, 20)}...` : null,
    });
    setAuthToken(isAuthenticated ? sessionToken || null : null);
  }, [sessionToken, isAuthenticated]);
}
