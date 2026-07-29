import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { GradientHeading } from "@/components/shared/GradientText";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/providers/AuthProvider";
import { storage } from "@/utils/storage";
import { validateEmail, validateRequired } from "@/utils/validators";
import { getErrorMessage } from "@/utils/error";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
} from "lucide-react";

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const language = storage.getLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || "/admin/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const emailError = validateRequired(email, "Email") || validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validateRequired(password, "Password");
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login({ email: email.trim(), password, rememberMe });
      // Navigation handled by AuthProvider
    } catch (err: any) {
      console.error("Login error:", err);
      const message = getErrorMessage(err, language === "am" ? "መግባት አልተሳካም" : "Login failed");

      if (err?.status === 401) {
        setError(
          language === "am"
            ? "ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም።"
            : "Invalid email or password. Please try again."
        );
      } else if (err?.status === 429) {
        setError(
          language === "am"
            ? "በጣም ብዙ ሙከራዎች። እባክዎ ቆይተው ይሞክሩ።"
            : "Too many login attempts. Please wait and try again."
        );
      } else if (err?.message?.includes("locked")) {
        setError(
          language === "am"
            ? "መለያዎ ተቆልፏል። እባክዎ ቆይተው ይሞክሩ።"
            : "Your account is locked. Please try again later."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show login form while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-woreda-dark">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="text-muted-foreground animate-pulse">
            {language === "am" ? "በመጫን ላይ..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Already authenticated — redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-woreda-dark flex items-center justify-center py-12 px-4">
      <Container maxWidth="sm" padding="none" className="w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === "am" ? "ወደ መነሻ ገጽ" : "Back to Home"}
        </Link>

        <Card variant="glass" className="w-full shadow-2xl">
          <CardHeader className="text-center pb-2">
            <Logo size="lg" variant="vertical" className="justify-center mb-4" showSubtitle />
            <CardTitle className="text-2xl">
              {language === "am" ? "አስተዳዳሪ መግቢያ" : "Admin Login"}
            </CardTitle>
            <CardDescription>
              {language === "am"
                ? "ወደ ዳሽቦርድዎ ለመግባት ይህን ይጠቀሙ"
                : "Sign in to access the admin dashboard"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="error" className="mb-4 animate-in fade-in-0 slide-in-from-top-2" dismissible onDismiss={() => setError(null)}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">
                  {language === "am" ? "ኢሜይል" : "Email"}
                  <span className="text-red-400 ml-1">*</span>
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@dangila.gov.et"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={fieldErrors.email}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">
                    {language === "am" ? "የይለፍ ቃል" : "Password"}
                    <span className="text-red-400 ml-1">*</span>
                  </Label>
                  <Link
                    to="/admin/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    {language === "am" ? "ረሱት?" : "Forgot?"}
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={fieldErrors.password}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                  {language === "am" ? "አስታውሰኝ" : "Remember me"}
                </Label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2"
                loading={loading}
                disabled={!email || !password}
                leftIcon={loading ? undefined : <LogIn className="h-5 w-5" />}
              >
                {loading
                  ? language === "am"
                    ? "በመግባት ላይ..."
                    : "Signing in..."
                  : language === "am"
                  ? "ግባ"
                  : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <Separator className="opacity-20" />

          <CardFooter className="flex flex-col gap-2 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              {language === "am"
                ? "ይህ ገጽ ለወረዳ ሰራተኞች ብቻ ነው።"
                : "This page is for authorized woreda staff only."}
            </p>
            <Link
              to="/"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {language === "am" ? "ለዜጎች አገልግሎት ይመለሱ" : "Return to citizen services"}
            </Link>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}