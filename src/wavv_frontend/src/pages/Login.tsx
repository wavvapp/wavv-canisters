import useAuth from "@/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import UserProfile from "@/components/user-profile-card";
import { useEffect, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import Scene from "@/components/wave-shader";

export default function Login() {
  const { login, isAuthenticated, error } = useAuth();
  const [popupsAreAllowed, setPopupsAreAllowed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const popupTestWindow = window.open("", "_blank", "width=1,height=1");

    if (!popupTestWindow || popupTestWindow.closed) {
      alert("Please allow popups for this site to continue authentication");
      return;
    }

    setPopupsAreAllowed(true);

    popupTestWindow.close();
  }, []);

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
              {"Login with Google to connect with internet identity."}
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
