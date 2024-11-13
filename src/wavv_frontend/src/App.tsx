import { AuthProvider } from "./providers/AuthProvider";
import Login from "./pages/Login";

const App = () => {

  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
};

export default App;
