import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdmin } from "@/hooks/use-admin";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LogOut,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Activity,
  Brain,
  Settings,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <AuthForm />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      <header
        className={`backdrop-blur-md border-b transition-colors duration-300 ${
          isDark
            ? "bg-black/20 border-white/10"
            : "bg-white/20 border-slate-200/50"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/learning")}
                className={`transition-colors duration-300 ${
                  isDark
                    ? "text-white hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-700/10"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isDark ? "text-white/70" : "text-slate-600"
                }`}
              >
                <User className="w-4 h-4" />
                <span>
                  Welcome back,{" "}
                  {userProfile?.full_name || user.email?.split("@")[0]}
                </span>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className={`transition-colors duration-300 ${
                    isDark
                      ? "text-white hover:bg-white/10"
                      : "text-slate-700 hover:bg-slate-700/10"
                  }`}
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <img
            src="/image.png"
            alt="Vizuara AI Labs"
            className="h-12 mx-auto mb-4 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h1
            className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Your Profile
          </h1>
          <p
            className={`transition-colors duration-300 ${
              isDark ? "text-gray-300" : "text-slate-600"
            }`}
          >
            Manage your account and track your learning progress
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div
              className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Loading profile...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Information */}
            <Card
              className={`backdrop-blur-md p-6 transition-colors duration-300 ${
                isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white/80 border-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <h2
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Profile Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Full Name
                  </label>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors duration-300 ${
                      isDark
                        ? "text-white bg-slate-800/50"
                        : "text-slate-900 bg-slate-100/50"
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      {userProfile?.full_name || "Not provided"}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Email Address
                  </label>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors duration-300 ${
                      isDark
                        ? "text-white bg-slate-800/50"
                        : "text-slate-900 bg-slate-100/50"
                    }`}
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      {userProfile?.email || user.email}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Account Role
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {userProfile?.role === "admin" ? (
                        <Shield className="w-4 h-4 text-purple-400" />
                      ) : (
                        <User className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="text-sm capitalize">
                        {userProfile?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Account Created
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-sm">
                          {new Date(
                            userProfile?.created_at || user.created_at
                          ).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-xs transition-colors duration-300 ${
                            isDark ? "text-gray-400" : "text-slate-500"
                          }`}
                        >
                          {new Date(
                            userProfile?.created_at || user.created_at
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Status */}
            <Card
              className={`backdrop-blur-md p-6 transition-colors duration-300 ${
                isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white/80 border-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <h2
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Account Status
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Email Verified
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.email_confirmed_at
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {user.email_confirmed_at
                          ? "Verified"
                          : "Pending Verification"}
                      </span>
                    </div>
                    {user.email_confirmed_at && (
                      <div
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          isDark ? "text-gray-400" : "text-slate-500"
                        }`}
                      >
                        Verified on{" "}
                        {new Date(user.email_confirmed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Last Sign In
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div
                      className={`text-sm transition-colors duration-300 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "First time"}
                    </div>
                    {user.last_sign_in_at && (
                      <div
                        className={`text-xs transition-colors duration-300 ${
                          isDark ? "text-gray-400" : "text-slate-500"
                        }`}
                      >
                        {new Date(user.last_sign_in_at).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Account Type
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {userProfile?.role === "admin"
                          ? "Administrator"
                          : "Free Learner"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Learning Progress */}
            <Card
              className={`backdrop-blur-md p-6 transition-colors duration-300 ${
                isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white/80 border-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h2
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Learning Progress
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Available Courses
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span
                          className={`text-sm transition-colors duration-300 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Self-Attention Mechanism
                        </span>
                      </div>
                      <div
                        className={`text-xs transition-colors duration-300 ${
                          isDark ? "text-gray-400" : "text-slate-500"
                        }`}
                      >
                        Interactive
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-1 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    Current Progress
                  </label>
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isDark ? "bg-slate-800/50" : "bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Workshop Completion
                      </span>
                      <span className="text-purple-400 text-sm">0%</span>
                    </div>
                    <div
                      className={`w-full rounded-full h-2 transition-colors duration-300 ${
                        isDark ? "bg-slate-700" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-4">
                  <Button
                    onClick={() => navigate("/learning")}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Start Learning Workshop
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card
          className={`backdrop-blur-md p-6 mt-6 transition-colors duration-300 ${
            isDark
              ? "bg-white/10 border-white/20"
              : "bg-white/80 border-slate-200/50"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/learning")}
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Brain className="w-4 h-4" />
              Workshop
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDark
                  ? "border-red-400/20 text-red-400 hover:bg-red-400/10"
                  : "border-red-400/40 text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              disabled
              className={`flex items-center gap-2 cursor-not-allowed transition-colors duration-300 ${
                isDark
                  ? "border-white/10 text-white/50"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              <Activity className="w-4 h-4" />
              Coming Soon
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
