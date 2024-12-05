import { useState, useEffect, ReactNode, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import useICPAuth from "@/hooks/useICPAuth";
import { AuthContext, JwtUserPayload } from "@/context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtUserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null)


  const {
    principal,
    setPrincipal,
    loginWithInternetIdentity,
    logout: logoutIcpLogout,
    points,
    getPoints,
    userExists,
    registerPrincipalOnWavvBackend
  } = useICPAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token) || null;
      setUser(decodedUser as unknown as JwtUserPayload);
      if (user?.sub) {
        getPoints({ id: user.sub });
      }
    }

    setLoading(false);
  }, [getPoints, user?.sub]);

  const updateAuthStates = useCallback(() => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        setError(null)
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        setError(null)
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

  const login = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const googleAuthToken = credentialResponse.credential || "";
      const decodedUser = jwtDecode(googleAuthToken);
      setUser(decodedUser as unknown as JwtUserPayload);

      // Check with wavv_backend if the email exist
      const isWavvUser = await userExists(googleAuthToken);
      if (!isWavvUser) {
        setError("Email account not found")
        return
      }

      localStorage.setItem("token", googleAuthToken);

      await loginWithInternetIdentity(
        decodedUser as unknown as JwtUserPayload,
        googleAuthToken
      );
      if (!decodedUser.sub || !principal) return

      await registerPrincipalOnWavvBackend(googleAuthToken, principal)
      await getPoints({ id: decodedUser.sub });
      updateAuthStates()
    },
    [userExists, loginWithInternetIdentity, principal, registerPrincipalOnWavvBackend, getPoints, updateAuthStates]
  );

  const logout = () => {
    setUser(null);
    localStorage.removeItem("points");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    logoutIcpLogout();

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
          error
        }}
      >
        {!loading && children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};
