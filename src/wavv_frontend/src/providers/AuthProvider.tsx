import { useState, useEffect, ReactNode, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import useICPAuth from "@/hooks/useICPAuth";
import { AuthContext, JwtUserPayload } from "@/context/AuthContext";
import { wavvApiService } from "@/service";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtUserPayload | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { principal, setPrincipal, loginWithInternetIdentity } = useICPAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const points = Number(localStorage.getItem("points"));
    if (token) {
      const decodedUser = jwtDecode(token) || null;
      setUser(decodedUser as unknown as JwtUserPayload);
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

      setUser(decodedToken as unknown as JwtUserPayload);
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

  const authenticateUserOnWavvApp = useCallback( async (token: string) => {
    /**
     * User registration for wavvapp be
     */
    const { data } = await wavvApiService.post("/auth/google-signin", {
      token,
      platform: "web",
      principal
    });
    localStorage.setItem("accessToken", data.access_token);
    
  }, [principal]);

  const login = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const token = credentialResponse.credential || "";
      const decodedUser = jwtDecode(token);
      setUser(decodedUser as unknown as JwtUserPayload);
      localStorage.setItem("token", token);

      // Connect with ICP II
      await loginWithInternetIdentity(decodedUser as unknown as JwtUserPayload);

      // Athenticate user on wavvapp
      await authenticateUserOnWavvApp(token)
      
      // Update auth status
      updateAuthStates();
    },
    [authenticateUserOnWavvApp, loginWithInternetIdentity, updateAuthStates]
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
