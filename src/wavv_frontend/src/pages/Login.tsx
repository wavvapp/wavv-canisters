import useAuth from "@/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import UserProfile from "@/components/user-profile-card";

export default function Login() {
  const { login, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className={`p-8 rounded-lg w-[600px] ${
          !(isAuthenticated) && " shadow-md"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {!(isAuthenticated) &&
            "Login with Google to connect with icp"}
        </h1>
        <div className="flex items-center justify-center">
          {!(isAuthenticated) && (
            <GoogleLogin onSuccess={login} useOneTap />
          )}

          {isAuthenticated && <UserProfile />}
        </div>
      </div>
    </div>
  );
}
