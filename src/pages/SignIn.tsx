import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      nav(redirect, { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      await signInWithGoogle();
      nav(redirect, { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Google sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container max-w-md py-16">
      <h1 className="font-display text-4xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to book or manage your services.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" size="lg" disabled={busy} onClick={google}>
        Continue with Google
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>

      <div className="mt-8 rounded-md border bg-secondary/40 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Demo accounts (emulator):</p>
        <p className="mt-1">buyer@localloop.dev / password123</p>
        <p>maria@localloop.dev / password123 (seller)</p>
        <p>admin@localloop.dev / password123 (admin)</p>
      </div>
    </section>
  );
}
