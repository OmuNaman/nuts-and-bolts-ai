import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Redirect to the intended destination or learning by default
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/image.png"
            alt="Vizuara AI Labs"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to AI Learning
          </h1>
          <p className="text-gray-300">Sign in to start your journey</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
