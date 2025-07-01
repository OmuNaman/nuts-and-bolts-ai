import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s]+$/,
        "Full name should only contain letters and spaces"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    mode: "onChange", // Validate on change for better user experience
  });

  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    try {
      setIsLoading(true);
      if (isSignUp) {
        const signUpData = data as SignUpFormData;
        await signUp(
          signUpData.email,
          signUpData.password,
          signUpData.fullName
        );
        toast({
          title: "Account created successfully!",
          description:
            "Please check your email to verify your account before signing in.",
        });
      } else {
        const signInData = data as SignInFormData;
        await signIn(signInData.email, signInData.password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      // Create more user-friendly toast messages
      let errorTitle = "Error";
      let errorMessage = error instanceof Error ? error.message : "An error occurred";
      let variant: "default" | "destructive" = "destructive";
      
      // Check for specific error messages and customize them
      if (errorMessage.includes("Invalid credentials")) {
        errorTitle = "Sign In Failed";
      } 
      else if (errorMessage.includes("Email not confirmed")) {
        errorTitle = "Verification Required";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset(); // Clear form when switching modes
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "Fill in all fields to create your account"
            : "Enter your credentials to access your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Full Name *"
              {...register("fullName", { required: true })}
              disabled={isLoading}
              required
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email Address *"
            {...register("email", { required: true })}
            disabled={isLoading}
            required
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password (min 6 characters) *"
            {...register("password", { required: true })}
            disabled={isLoading}
            required
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Confirm Password *"
              {...register("confirmPassword", { required: true })}
              disabled={isLoading}
              required
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </Button>

        {!isSignUp && (
          <p className="text-xs text-muted-foreground text-center">
            First time user? Please click the Sign Up button below to create an account.
          </p>
        )}

        <p className="text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-500 hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </form>
    </Card>
  );
}
