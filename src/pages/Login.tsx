import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import logoYellow from "@/assets/logo-yellow.png";
import logoGreenDark from "@/assets/logo-green-dark.png";
import logoBlack from "@/assets/logo-black.png";
import logoGreenWhite from "@/assets/logo-green-white.png";
import logoGreenDark2 from "@/assets/logo-green-dark2.png";
import logoBlack2 from "@/assets/logo-black2.png";

const logos = [
  { src: logoGreenDark, label: "Option A – Green on dark text" },
  { src: logoGreenDark2, label: "Option B – Green on dark text (alt)" },
  { src: logoYellow, label: "Option C – Yellow accent" },
  { src: logoBlack, label: "Option D – Black with faded elements" },
  { src: logoBlack2, label: "Option E – Black with faded (alt)" },
  { src: logoGreenWhite, label: "Option F – Green on white text", dark: true },
];

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
    <div className="min-h-screen flex flex-col items-center justify-start bg-background px-4 py-8 font-nunito">
      <h2 className="text-lg font-bold text-foreground mb-6">
        Compare logo options — pick your favourite
      </h2>

      {/* Logo comparison grid */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {logos.map((logo) => (
          <div
            key={logo.label}
            className={`rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3 shadow-sm ${
              logo.dark ? "bg-secondary" : "bg-card"
            }`}
          >
            <img
              src={logo.src}
              alt={logo.label}
              className="h-14 w-auto object-contain"
            />
            <span className={`text-xs font-medium ${logo.dark ? "text-secondary-foreground/70" : "text-muted-foreground"}`}>
              {logo.label}
            </span>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
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
