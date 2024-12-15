import { AuthProvider } from "./providers/AuthProvider";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/toaster";

const App = () => {

  return (
    <AuthProvider>
      <Login />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
