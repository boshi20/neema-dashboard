import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md animate-scale-in relative">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto">
            <img src="/logo.png" alt="Neema" className="h-28 w-auto" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mt-2">
              {isSignup ? t("login.signupSubtitle") : t("login.subtitle")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="restaurantName">{t("login.restaurantName")}</Label>
                <Input
                  id="restaurantName"
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Neema Restaurant"
                  className="h-11 glass-subtle"
                  minLength={2}
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="restaurant@neema.com"
                className="h-11 glass-subtle"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 glass-subtle"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 gradient-primary shadow-glow hover:opacity-90 transition-opacity text-base font-medium"
              disabled={loading}
            >
              {loading
                ? t("common.loading")
                : isSignup
                  ? t("login.createAccount")
                  : t("login.signIn")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignup ? t("login.haveAccount") : t("login.noAccount")}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
