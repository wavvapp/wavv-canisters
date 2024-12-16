import useAuth from "@/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import UserProfile from "@/components/user-profile-card";
import { useEffect } from "react";
import { useToast } from "@/components/hooks/use-toast";
import Scene from "@/components/wave-shader";

export default function Login() {
  const { login, isAuthenticated, error } = useAuth();
  const { toast } = useToast();


  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: error,
        description:
          "Please download wavvapp and create account here! https://wavvapp.com/",
      });
    }
  }, [error, toast]);

  return (
    <>
      <Scene />
      <div className="flex min-h-screen items-center justify-center">
        {!isAuthenticated && (
          <div
            className={
              "p-8 w-[600px] text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl"
            }
          >
            <h1 className="text-2xl font-bold mb-6 text-center">
              Login with Google and connect your account with internet identity
            </h1>
            <div className="flex items-center justify-center">
              <GoogleLogin onSuccess={login} useOneTap />
            </div>
          </div>
        )}

        {isAuthenticated && <UserProfile />}
      </div>
    </>
  );
}
