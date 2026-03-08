import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import logoGreenDark from "@/assets/logo-green-dark.png";
import citrusWheel from "@/assets/citrus-wheel.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError || !roles || roles.length === 0) {
        setError("No role assigned to this account. Contact your administrator.");
        setLoading(false);
        return;
      }

      const role = roles[0].role;

      switch (role) {
        case "owner":
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "employer_admin":
          navigate("/employer/dashboard");
          break;
        case "supervisor":
        case "hr_approver":
          navigate("/approvals");
          break;
        case "employee":
          navigate("/employee/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 font-nunito relative overflow-hidden">
      {/* Decorative citrus wheel cluster — bottom-left corner */}
      <img src={citrusWheel} alt="" aria-hidden="true" className="pointer-events-none select-none absolute -bottom-20 -left-24 w-72 opacity-100 -rotate-[15deg]" style={{ filter: 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)' }} />
      <img src={citrusWheel} alt="" aria-hidden="true" className="pointer-events-none select-none absolute bottom-32 -left-12 w-44 opacity-100 rotate-[30deg]" style={{ filter: 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)' }} />
      <img src={citrusWheel} alt="" aria-hidden="true" className="pointer-events-none select-none absolute -bottom-6 left-44 w-32 opacity-100 -rotate-[40deg]" style={{ filter: 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)' }} />

      <div className="w-full max-w-md relative z-10">
        <form
          onSubmit={handleLogin}
          className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-lg"
        >
          {/* Default logo for the form */}
          <div className="flex justify-center">
            <img src={logoGreenDark} alt="Lamoola" className="h-12 w-auto" />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              Sign in to your account
            </h1>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base h-12"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
            >
              Forgot your password?
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Lamoola. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
