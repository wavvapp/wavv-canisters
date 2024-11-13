import { useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import useICPAuth from "@/hooks/useICPAuth";
import { AuthContext, JwtPayload } from "@/context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { principal, setPrincipal, loginWithInternetIdentity } = useICPAuth();

  const isSucessfulyConnected = useMemo(
    () => !!isAuthenticated && !!principal,
    [isAuthenticated, principal]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token) || null;
      setUser(decodedUser as unknown as JwtPayload);
    }
    
    setLoading(false);
  }, []);

  const checkAuthStatus = useCallback(() => {
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
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential || "";
    const decodedUser = jwtDecode(token);
    setUser(decodedUser as unknown as JwtPayload);
    localStorage.setItem("token", token);

    // Connect with ICP II
    await loginWithInternetIdentity();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
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
          checkAuthStatus,
          principal,
          setPrincipal,
          isSucessfulyConnected,
        }}
      >
        {!loading && children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};
