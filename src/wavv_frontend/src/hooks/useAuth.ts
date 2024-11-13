import { CredentialResponse } from "@react-oauth/google";
import { JwtPayload } from "jwt-decode";
import { createContext, useContext } from "react";


interface AuthContextType {
  user: JwtPayload | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentialResponse: CredentialResponse) => void;
  logout: () => void;
  checkAuthStatus: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
