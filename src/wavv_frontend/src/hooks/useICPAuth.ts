import { popupCenter } from "@/lib/utils";
import { AuthClient } from "@dfinity/auth-client";
import { useCallback, useLayoutEffect, useState } from "react";

export type ICPAuthReturn = {
  loginWithInternetIdentity: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  principal: string | null;
  setPrincipal: (principal: string | null) => void;
};

function useICPAuth(): ICPAuthReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  // Initialize the AuthClient and check if the user is authenticated
  useLayoutEffect(() => {
    async function initializeAuthClient() {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);

      // Check if the user is already authenticated - local storage session
      const authStatus = await client.isAuthenticated();
      if (authStatus) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
      }
      setIsLoading(false);
    }
    initializeAuthClient();
  }, [setPrincipal]);

  const loginWithInternetIdentity = useCallback(async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: "https://identity.internetcomputer.org",
        onSuccess: () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal().toText());
        },
        windowOpenerFeatures: popupCenter(),
      });
    }
  }, [authClient, setPrincipal]);

  const logout = useCallback(async () => {
    if (authClient) {
      await authClient.logout();
      setPrincipal(null);
      /* 
      Creating a new instance of authClient to 
      prevent unexpected behaviour during subsequent login
      */
      await AuthClient.create();
    }
  }, [authClient, setPrincipal]);

  return { loginWithInternetIdentity, logout, isLoading, principal, setPrincipal };
}

export default useICPAuth;
