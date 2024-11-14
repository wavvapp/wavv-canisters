import { useState, useEffect, ReactNode, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import useICPAuth from "@/hooks/useICPAuth";
import { AuthContext, JwtPayload } from "@/context/AuthContext";
import {canisterApiService, wavvApiService} from "@/service";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { principal, setPrincipal, loginWithInternetIdentity } = useICPAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const points = Number(localStorage.getItem("points"));
    if (token) {
      const decodedUser = jwtDecode(token) || null;
      setUser(decodedUser as unknown as JwtPayload);
      setPoints(points);
    }

    setLoading(false);
  }, []);

  const updateAuthStates = useCallback(() => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(decodedToken as unknown as JwtPayload);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateAuthStates();
  }, [updateAuthStates]);

  const registerWavvAccount = useCallback(async (token: string) => {
    /**
     * User registration on canister of keeping track points
    */
    const response = await canisterApiService.post("/users", {
      principal,
      email: user?.email,
    });
    setPoints(response.data.points);
    localStorage.setItem("points", response.data.points || 0);

    /**
     * User registration for wavvapp access
    */
    const { data } = await wavvApiService.post("/auth/google-signin", {
      token,
      platform: "web" ,
    })
    localStorage.setItem("accessToken", data.access_token);

  }, [principal, user?.email])

  const login = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const token = credentialResponse.credential || "";
      const decodedUser = jwtDecode(token);
      setUser(decodedUser as unknown as JwtPayload);
      localStorage.setItem("token", token);

      // Connect with ICP II
      await loginWithInternetIdentity();

      // Register account to wavv if not exist
      await registerWavvAccount(token)

      // Update auth status
      updateAuthStates();
    },
    [loginWithInternetIdentity, registerWavvAccount, updateAuthStates]
  );

  const logout = () => {
    setUser(null);
    localStorage.removeItem("points");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");

    // Update auth status
    updateAuthStates();
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthContext.Provider
        value={{
          user,
          loading,
          login,
          logout,
          isAuthenticated,
          updateAuthStates,
          principal,
          setPrincipal,
          points,
        }}
      >
        {!loading && children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};
