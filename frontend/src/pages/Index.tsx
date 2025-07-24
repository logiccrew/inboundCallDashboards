import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SingUp } from "@/components/auth/signup";
import { Dashboard } from "@/components/dashboard/Dashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAccount, setIsAccount] = useState(false);

  const handleLogin = (credentials: { email: string; password: string }) => {
 

    setIsAuthenticated(true);
  };

 

  if (!isAuthenticated) {
     return <LoginForm/>
  }

  return <Dashboard />;
};

export default Index;
