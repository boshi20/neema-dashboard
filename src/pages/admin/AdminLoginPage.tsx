import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { NotAdminError, useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminSignIn } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminSignIn(email, password);
      toast({ title: t("login.success") });
      navigate("/admin");
    } catch (error) {
      const message =
        error instanceof NotAdminError
          ? t("admin.notAdmin")
          : error instanceof Error
            ? error.message
            : t("login.error");
      toast({ title: t("login.error"), description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

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
                {t("admin.wordmark")}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="flex items-center justify-center gap-2 text-xl font-semibold tracking-tight text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t("admin.loginTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("admin.loginSubtitle")}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nema.app"
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
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="h-10 w-full gradient-primary text-base font-medium shadow-glow transition-opacity hover:opacity-90"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("login.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
