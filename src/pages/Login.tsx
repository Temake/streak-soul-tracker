
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { SignupForm, SignupFormValues } from "@/components/auth/SignupForm";
import { AuthAlert } from "@/components/auth/AuthAlert";

export default function Login() {
  const { login, signup, isAuthenticated, error } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if URL has signup parameter or email confirmation hash
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setActiveTab("signup");
    }
    
    // Check for email confirmation in URL
    if (location.hash.includes('type=signup') || location.hash.includes('type=recovery')) {
      setShowConfirmationMessage(true);
      setActiveTab("login");
    }
  }, [location]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    await signup(data.name, data.email, data.password);
    setShowConfirmationMessage(true);
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-md mx-auto rounded-xl shadow-lg animate-scale-in border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            Welcome to Bethel
          </CardTitle>
          <CardDescription className="text-center">
            Track your spiritual journey and maintain consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showConfirmationMessage && (
            <AuthAlert 
              message="Please check your email for a confirmation link. You'll need to confirm your email before you can log in."
            />
          )}
          
          {error && (
            <AuthAlert 
              variant="destructive" 
              message={error}
            />
          )}
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm 
                onSubmit={onLoginSubmit} 
                isSubmitting={false}
              />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <SignupForm 
                onSubmit={onSignupSubmit} 
                isSubmitting={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-center text-sm text-muted-foreground mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
