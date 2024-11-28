import useAuth from "@/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import UserProfile from "@/components/user-profile-card";
import { useEffect, useState } from "react";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [ popupsAreAllowed, setPopupsAreAllowed ] = useState(false)

  useEffect(() => {
    const popupTestWindow = window.open('', '_blank', 'width=1,height=1');

    if (!popupTestWindow || popupTestWindow.closed) {
      alert('Please allow popups for this site to continue authentication');
      return;
    }

    setPopupsAreAllowed(true)

    popupTestWindow.close();
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className={`p-8 rounded-lg w-[600px] ${
          !(isAuthenticated) && "shadow-md bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {!(isAuthenticated) &&
            "Login with Google to connect with internet identity."}
        </h1>
        <div className="flex items-center justify-center">
          {!(isAuthenticated) && (popupsAreAllowed) && (
            <GoogleLogin onSuccess={login} useOneTap />
          )}

          {isAuthenticated && <UserProfile />}
        </div>
      </div>
    </div>
  );
}
