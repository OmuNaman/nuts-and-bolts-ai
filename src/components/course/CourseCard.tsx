import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/lib/supabase";
import { PlayCircle, CheckCircle } from "lucide-react";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type CourseProgress = Database["public"]["Tables"]["course_progress"]["Row"];

interface CourseCardProps {
  course: Course;
  progress?: CourseProgress;
  onStart?: () => void;
  onContinue?: () => void;
}

export function CourseCard({
  course,
  progress,
  onStart,
  onContinue,
}: CourseCardProps) {
  const isStarted = progress?.status === "in_progress";
  const isCompleted = progress?.status === "completed";

  return (
    <Card className="overflow-hidden">
      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {course.description}
        </p>

        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} />
          </div>
        )}

        <Button className="w-full" onClick={isStarted ? onContinue : onStart}>
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : isStarted ? (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Course
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
