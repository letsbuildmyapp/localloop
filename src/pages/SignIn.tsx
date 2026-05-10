import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Loader2, ShoppingBag, Store, ShieldCheck } from "lucide-react";

const DEMO_PASSWORD = "password123";

const DEMO_LOGINS = [
  {
    email: "buyer@localloop.dev",
    password: DEMO_PASSWORD,
    label: "Buyer",
    description: "Sam Rivera · Austin, TX",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-500",
  },
  {
    email: "maria@localloop.dev",
    password: DEMO_PASSWORD,
    label: "Seller",
    description: "Maria Alvarez · Eco-friendly cleaner",
    icon: Store,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    email: "admin@localloop.dev",
    password: DEMO_PASSWORD,
    label: "Admin",
    description: "Platform admin",
    icon: ShieldCheck,
    color: "from-indigo-500 to-violet-500",
  },
];

export default function SignIn() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      nav(redirect, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin(d: (typeof DEMO_LOGINS)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setDemoLoading(d.email);
    try {
      await signIn(d.email, d.password);
      toast.success(`Signed in as ${d.label}`);
      nav(redirect, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Sign in failed");
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
        }}
      />


      <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-8 sm:pt-12 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <Card className="relative overflow-hidden border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-sm">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in to LocalLoop</h1>
              <p className="text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  One-click demo logins
                </span>
                <span className="text-[10px] text-muted-foreground">No password needed</span>
              </div>
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onDemoLogin(d)}
                  disabled={demoLoading !== null || loading}
                  className="group flex items-center gap-3 rounded-lg border border-border/70 bg-background/40 p-3 text-left transition-all hover:border-primary/40 hover:bg-background disabled:opacity-50"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${d.color} text-white shadow-sm`}
                  >
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.description}</div>
                  </div>
                  {demoLoading === d.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-card/80 px-3 text-muted-foreground">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-muted-foreground sm:px-10">
        <a
          href="https://letsbuildmyapp.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
