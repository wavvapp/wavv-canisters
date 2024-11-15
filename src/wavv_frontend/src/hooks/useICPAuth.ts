import { JwtUserPayload } from "@/context/AuthContext";
import { popupCenter } from "@/lib/utils";
import { canisterApiService } from "@/service";
import { AuthClient } from "@dfinity/auth-client";
import { useCallback, useLayoutEffect, useState } from "react";

export type ICPAuthReturn = {
  loginWithInternetIdentity: (user: JwtUserPayload) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  principal: string | null;
  setPrincipal: (principal: string | null) => void;
  points: number;
};

function useICPAuth(): ICPAuthReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [points, setPoints] = useState(0);

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

  /**
   * User registration on canister of keeping track points
   * Here we use princial, to unquely identify users
   */
  const registerUserIdentityOnWavvCanister = useCallback(
    async (principal: string, user: JwtUserPayload) => {
      const response = await canisterApiService.post("/users", {
        principal,
        email: user?.email,
      });
      setPoints(response.data.points);
      localStorage.setItem("points", response.data.points || 0);
    },
    []
  );

  const loginWithInternetIdentity = useCallback(
    async (user: JwtUserPayload) => {
      if (authClient) {
        await authClient.login({
          identityProvider: "https://identity.internetcomputer.org",
          onSuccess: async () => {
            const identity = authClient.getIdentity();
            setPrincipal(identity.getPrincipal().toText());

            await registerUserIdentityOnWavvCanister(
              identity.getPrincipal().toText(),
              user
            );
          },
          windowOpenerFeatures: popupCenter(),
        });
      }
    },
    [authClient, registerUserIdentityOnWavvCanister]
  );

  const logout = useCallback(async () => {
    if (authClient) {
      await authClient.logout();
      setPrincipal(null);
      /* 
      * Creating a new instance of authClient to 
      * prevent unexpected behaviour during subsequent login
      */
      await AuthClient.create();
    }
  }, [authClient, setPrincipal]);

  return {
    loginWithInternetIdentity,
    logout,
    isLoading,
    principal,
    setPrincipal,
    points,
  };
}

export default useICPAuth;
