import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Role } from "@/types";

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") === "seller" ? "seller" : "buyer") as Role;
  const nav = useNavigate();

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      await signUp(email, password, name, role);
      toast.success("Account created");
      nav(role === "seller" ? "/seller" : "/dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container max-w-md py-16">
      <h1 className="font-display text-4xl font-semibold">Create your account</h1>
      <p className="mt-2 text-muted-foreground">It takes about 30 seconds.</p>

      <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buyer">I need help</TabsTrigger>
          <TabsTrigger value="seller">I'm a pro</TabsTrigger>
        </TabsList>
        <TabsContent value="buyer" className="pt-2 text-sm text-muted-foreground">
          Browse and book trusted local pros.
        </TabsContent>
        <TabsContent value="seller" className="pt-2 text-sm text-muted-foreground">
          List services, get bookings, and earn on your schedule.
        </TabsContent>
      </Tabs>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" size="lg" onClick={() => signInWithGoogle(role).then(() => nav("/dashboard"))}>
        Continue with Google
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        Already a member? <Link to="/signin" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </section>
  );
}
