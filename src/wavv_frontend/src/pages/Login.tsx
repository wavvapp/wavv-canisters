import useAuth from "@/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import UserProfile from "@/components/user-profile-card";

export default function Login() {
  const { login, isSucessfulyConnected } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className={`p-8 rounded-lg w-[600px] ${
          !isSucessfulyConnected && " shadow-md"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {!isSucessfulyConnected && "Login with Google to connect with icp"}
        </h1>
        <div className="flex items-center justify-center">
          {!isSucessfulyConnected && (
            <GoogleLogin onSuccess={login} useOneTap />
          )}

          {isSucessfulyConnected && <UserProfile />}
        </div>
      </div>
    </div>
  );
}
