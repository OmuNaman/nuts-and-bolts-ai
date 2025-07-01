import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CourseCard } from "./CourseCard";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type CourseProgress = Database["public"]["Tables"]["course_progress"]["Row"];

export function CourseList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Fetch published courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "published");

        if (coursesError) throw coursesError;
        setCourses(coursesData);

        // Fetch progress for logged-in user
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("course_progress")
            .select("*")
            .eq("user_id", user.id);

          if (progressError) throw progressError;

          const progressMap = progressData.reduce((acc, curr) => {
            acc[curr.course_id] = curr;
            return acc;
          }, {} as Record<string, CourseProgress>);

          setProgress(progressMap);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [user]);

  const handleStartCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start the course",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("course_progress")
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: "in_progress",
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setProgress((prev) => ({
        ...prev,
        [courseId]: data,
      }));

      toast({
        title: "Course started",
        description: "Your progress will be tracked automatically",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start course",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={progress[course.id]}
          onStart={() => handleStartCourse(course.id)}
          onContinue={() => {
            /* Handle continue */
          }}
        />
      ))}
    </div>
  );
}
