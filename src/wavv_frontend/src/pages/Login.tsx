import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { login, isAuthenticated } = useAuth();

  const icpLogin = async () => {
    const authClient = await AuthClient.create();

    await new Promise((resolve) => {
      authClient.login({
        identityProvider: process.env.II_URL,
        onSuccess: resolve,
      });
    });

    const identity = authClient.getIdentity();
    const agent = HttpAgent.create({ identity });

    console.log(agent)

    return false;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-8 rounded-lg shadow-md w-[600px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login with Google
        </h1>
        <div className="flex items-center justify-between">
          <GoogleLogin onSuccess={login} useOneTap />

          {isAuthenticated && (
            <Button variant="outline" onClick={icpLogin}>
              Connect your ICP account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
