import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Mode = "signin" | "signup";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast({ title: t("login.success") });
        navigate("/");
      } else {
        const { needsConfirmation } = await signUp(email, password, restaurantName);
        if (needsConfirmation) {
          toast({
            title: t("login.confirmEmailTitle"),
            description: t("login.confirmEmailBody"),
          });
          setMode("signin");
        } else {
          toast({ title: t("login.success") });
          navigate("/");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("login.error");
      toast({ title: t("login.error"), description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Single soft brand tint behind the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md animate-scale-in border-border/70 shadow-sm">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="NEMA" className="h-14 w-auto" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">NEMA</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t("common.forBusiness")}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {isSignup ? t("login.signUpTitle") : t("login.signInTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup ? t("login.signupSubtitle") : t("login.subtitle")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid gap-1.5">
                <Label htmlFor="restaurantName">{t("login.restaurantName")}</Label>
                <Input
                  id="restaurantName"
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Neema Restaurant"
                  className="h-10"
                  minLength={2}
                  required
                />
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="restaurant@neema.com"
                className="h-10"
                dir="ltr"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pe-10"
                  dir="ltr"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="h-10 w-full gradient-primary text-base font-medium shadow-glow transition-opacity hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignup ? (
                t("login.createAccount")
              ) : (
                t("login.signIn")
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="mt-5 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="font-medium text-primary">
              {isSignup ? t("login.haveAccount") : t("login.noAccount")}
            </span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
