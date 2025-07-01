import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/hooks/use-admin";
import {
  Edit2,
  Users,
  BarChart3,
  Search,
  Download,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types based on actual database schema
type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

type CourseProgress = {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
  created_at: string;
  // Joined data
  course_title?: string;
  user_name?: string;
  user_email?: string;
};

type Analytics = {
  total_students: number;
  active_students: number;
  avg_completion_rate: number;
  recent_signups: number;
};

export function AdminDashboard() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Edit states
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);

  // Dialog states
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);

  const { toast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  async function fetchAllData() {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchCourseProgress(),
        calculateAnalytics(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      // Get profiles data with real email from database
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      setStudents(profiles || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }

  async function fetchCourseProgress() {
    try {
      const { data, error } = await supabase
        .from("course_progress")
        .select(
          `
          *,
          courses(title),
          profiles(full_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const progressWithUserData =
        data?.map(
          (progress: {
            id: string;
            user_id: string;
            course_id: string;
            progress: number;
            status: string;
            started_at: string;
            completed_at: string | null;
            created_at: string;
            courses: { title: string } | null;
            profiles: { full_name: string | null; email: string } | null;
          }) => ({
            id: progress.id,
            user_id: progress.user_id,
            course_id: progress.course_id,
            progress: progress.progress,
            status: progress.status as
              | "not_started"
              | "in_progress"
              | "completed",
            started_at: progress.started_at,
            completed_at: progress.completed_at,
            created_at: progress.created_at,
            course_title: progress.courses?.title || "Unknown Course",
            user_name: progress.profiles?.full_name || "Anonymous User",
            user_email: progress.profiles?.email || "No email",
          })
        ) || [];

      setCourseProgress(progressWithUserData);
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  }

  async function calculateAnalytics() {
    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get active students (those with recent progress)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: activeStudents } = await supabase
        .from("course_progress")
        .select("user_id", { count: "exact", head: true })
        .gte("updated_at", oneWeekAgo.toISOString());

      // Get recent signups (last week)
      const { count: recentSignups } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      // Calculate average completion rate
      const { data: allProgress } = await supabase
        .from("course_progress")
        .select("progress");

      const avgProgress =
        allProgress?.length > 0
          ? Math.round(
              allProgress.reduce((sum, p) => sum + p.progress, 0) /
                allProgress.length
            )
          : 0;

      setAnalytics({
        total_students: totalStudents || 0,
        active_students: activeStudents || 0,
        avg_completion_rate: avgProgress,
        recent_signups: recentSignups || 0,
      });
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  }

  const handleStudentRoleChange = async (
    studentId: string,
    newRole: "user" | "admin"
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", studentId);

      if (error) throw error;

      setStudents(
        students.map((student) =>
          student.id === studentId ? { ...student, role: newRole } : student
        )
      );

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async (studentData: Partial<Profile>) => {
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...studentData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingStudent.id);

      if (error) throw error;

      setStudents(
        students.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...studentData }
            : student
        )
      );

      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
  );

  const getStatusBadge = (role: "user" | "admin") => {
    const variants = {
      user: "bg-blue-100 text-blue-800 border-blue-200",
      admin: "bg-purple-100 text-purple-800 border-purple-200",
    };

    if (isDark) {
      return {
        user: "bg-blue-900/30 text-blue-300 border-blue-700",
        admin: "bg-purple-900/30 text-purple-300 border-purple-700",
      }[role];
    }

    return variants[role];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressForUser = (userId: string) => {
    const userProgress = courseProgress.filter((p) => p.user_id === userId);
    const completedCourses = userProgress.filter(
      (p) => p.status === "completed"
    ).length;
    const avgProgress =
      userProgress.length > 0
        ? Math.round(
            userProgress.reduce((sum, p) => sum + p.progress, 0) /
              userProgress.length
          )
        : 0;

    return {
      completed: completedCourses,
      total: userProgress.length,
      avgProgress,
      timeSpent: userProgress.length * 2.5, // Estimate hours
    };
  };

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="text-lg">Checking permissions...</div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <Card className="p-8 max-w-md mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
          isDark
            ? "bg-slate-800/80 border-slate-700"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className={`transition-colors duration-300 ${
                  isDark
                    ? "text-white hover:bg-slate-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-500" />
                <h1
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
                className={`transition-colors duration-300 ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Refresh Data
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card
                    className={`p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Total Students
                        </p>
                        <p className="text-3xl font-bold text-blue-500">
                          {analytics.total_students.toLocaleString()}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Active Students
                        </p>
                        <p className="text-3xl font-bold text-green-500">
                          {analytics.active_students.toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Avg Progress
                        </p>
                        <p className="text-3xl font-bold text-purple-500">
                          {analytics.avg_completion_rate}%
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-purple-500" />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          New This Week
                        </p>
                        <p className="text-3xl font-bold text-orange-500">
                          {analytics.recent_signups.toLocaleString()}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card
                  className={`p-6 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Recent Student Activity
                  </h3>
                  <div className="space-y-4">
                    {courseProgress.slice(0, 5).map((progress) => (
                      <div
                        key={progress.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {progress.user_name?.charAt(0) ||
                              progress.user_email?.charAt(0) ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {progress.user_name || "Anonymous User"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {progress.course_title} -{" "}
                              {progress.status.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {progress.progress}% complete
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(progress.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Student Management
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  onClick={() => setShowAddStudentDialog(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button
                  onClick={fetchStudents}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredStudents.map((student) => {
                const progress = getProgressForUser(student.id);
                return (
                  <Card
                    key={student.id}
                    className={`p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {student.full_name?.charAt(0) ||
                            student.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div>
                          <h3
                            className={`font-semibold text-lg ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {student.full_name || "Anonymous User"}
                          </h3>
                          <p
                            className={`text-sm ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {student.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500">
                              Joined: {formatDate(student.created_at)}
                            </span>
                            <span className="text-xs text-slate-500">
                              Last updated: {formatDate(student.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Progress */}
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-500">
                            Progress
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${progress.avgProgress}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {progress.avgProgress}%
                            </span>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Role
                          </p>
                          <select
                            value={student.role}
                            onChange={(e) =>
                              handleStudentRoleChange(
                                student.id,
                                e.target.value as "user" | "admin"
                              )
                            }
                            className={`text-xs px-2 py-1 rounded border ${getStatusBadge(
                              student.role
                            )}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingStudent(student)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Learning Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Progress Overview */}
              <Card
                className={`p-6 transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Student Progress Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Students with Progress</span>
                    <span className="text-sm font-medium">
                      {courseProgress.length} students
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (courseProgress.length /
                            Math.max(students.length, 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed Courses</span>
                    <span className="text-sm font-medium">
                      {
                        courseProgress.filter((p) => p.status === "completed")
                          .length
                      }{" "}
                      completions
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (courseProgress.filter(
                            (p) => p.status === "completed"
                          ).length /
                            Math.max(courseProgress.length, 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Top Performing Students */}
              <Card
                className={`p-6 transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Top Performing Students
                </h3>
                <div className="space-y-3">
                  {students
                    .map((student) => ({
                      ...student,
                      progress: getProgressForUser(student.id),
                    }))
                    .sort(
                      (a, b) => b.progress.avgProgress - a.progress.avgProgress
                    )
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 w-6">
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {student.full_name?.charAt(0) ||
                            student.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {student.full_name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.progress.avgProgress}% average progress
                          </p>
                        </div>
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Student Dialog */}
      <Dialog
        open={!!editingStudent}
        onOpenChange={() => setEditingStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information below.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <EditStudentForm
              student={editingStudent}
              onSave={handleEditStudent}
              onCancel={() => setEditingStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog
        open={showAddStudentDialog}
        onOpenChange={setShowAddStudentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student account.</DialogDescription>
          </DialogHeader>
          <AddStudentForm
            onSave={(data) => {
              // Note: In real implementation, you'd need to create user via auth
              console.log("Add student:", data);
              setShowAddStudentDialog(false);
              toast({
                title: "Note",
                description:
                  "Student creation via admin panel requires backend implementation",
                variant: "default",
              });
            }}
            onCancel={() => setShowAddStudentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Components
function EditStudentForm({
  student,
  onSave,
  onCancel,
}: {
  student: Profile;
  onSave: (data: Partial<Profile>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: student.full_name || "",
    email: student.email || "",
    role: student.role,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData({ ...formData, role: value as "user" | "admin" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}

function AddStudentForm({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    full_name: string;
    email: string;
    role: "user" | "admin";
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "user" as "user" | "admin",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData({ ...formData, role: value as "user" | "admin" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Create Student</Button>
      </DialogFooter>
    </div>
  );
}
