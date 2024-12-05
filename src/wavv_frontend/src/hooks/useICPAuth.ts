import { JwtUserPayload } from "@/context/AuthContext";
import { popupCenter } from "@/lib/utils";
import { canisterApiService, wavvApiService } from "@/service";
import { AuthClient } from "@dfinity/auth-client";
import { useCallback, useLayoutEffect, useState } from "react";

export type ICPAuthReturn = {
  loginWithInternetIdentity: (
    user: JwtUserPayload,
    googleAuthToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  points: number;
  getPoints: ({ id }: { id: string }) => void;
  userExists: (token: string) => Promise<boolean>
};

function useICPAuth(): ICPAuthReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [points, setPoints] = useState(0);

  const getPoints = useCallback(async ({ id }: { id: string }) => {
    const response = await canisterApiService.get(`users/${id}`);
    setPoints(response.data?.points || 0);
  }, []);

  // Initialize the AuthClient and check if the user is authenticated
  useLayoutEffect(() => {
    async function initializeAuthClient() {
      const client: AuthClient = await AuthClient.create();
      setAuthClient(client);

      // Check if the user is already authenticated - local storage session
      const authStatus = await client.isAuthenticated();
      if (authStatus) {
        const identity = client.getIdentity();
        localStorage.setItem("principal", identity.getPrincipal().toText())
      }
      setIsLoading(false);
    }
    initializeAuthClient();
  }, []);

  /**
   * User registration on canister of keeping track points
   * Here we use princial, to unquely identify users
   */
  const registerUserIdentityOnWavvCanister = useCallback(
    async (principal: string, user: JwtUserPayload) => {
      await canisterApiService.post("/users", {
        principal,
        id: user?.sub,
      });
    },
    []
  );

  const registerPrincipalOnWavvBackend = useCallback(async (token: string, principal: string) => {
    const { data } = await wavvApiService.post("/auth/google-signin", {
      token,
      platform: "web",
      principal,
    });
    localStorage.setItem("accessToken", data.access_token);
  }, [])

  /**
  * Check if the user exist on be
  */
  const userExists = useCallback(
    async (token: string) => {
      const { status } = await wavvApiService.post("/auth/google-signin", {
        token,
        platform: "web",
      });
      return status === 200
    },
    []
  );

  const loginWithInternetIdentity = useCallback(
    async (user: JwtUserPayload, googleAuthToken: string) => {
      if (authClient) {
        await authClient.login({
          identityProvider: "https://identity.internetcomputer.org",
          onSuccess: async () => {
            const identity = authClient.getIdentity();
            localStorage.setItem("principal", identity.getPrincipal().toText())

            await registerUserIdentityOnWavvCanister(
              identity.getPrincipal().toText(),
              user
            );
            await registerPrincipalOnWavvBackend(googleAuthToken, identity.getPrincipal().toText())
          },
          windowOpenerFeatures: popupCenter(),
        });
      }
    },
    [authClient, registerPrincipalOnWavvBackend, registerUserIdentityOnWavvCanister]
  );

  const logout = useCallback(async () => {
    if (authClient) {
      await authClient.logout();
      localStorage.removeItem("principal")
      /*
       * Creating a new instance of authClient to
       * prevent unexpected behaviour during subsequent login
       */
      await AuthClient.create();
    }
  }, [authClient]);

  return {
    loginWithInternetIdentity,
    logout,
    isLoading,
    points,
    getPoints,
    userExists,
  };
}

export default useICPAuth;
