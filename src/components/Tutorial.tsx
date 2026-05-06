import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  CalendarCheck,
  MessageCircle,
  Star,
  Plus,
  Inbox,
  Wallet,
  ShieldCheck,
  UserCircle,
  Store,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

const TUTORIAL_KEY_PREFIX = "localloop:tutorial_seen:";
const MOBILE_BREAKPOINT = 768;

type Step = {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
  target?: string;
  placement?: "right" | "left" | "top" | "bottom";
};

const BUYER_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to LocalLoop",
    body: "Your friendly neighborhood marketplace for help, hands, and hustle. Take a quick walk-through and you'll be off in 30 seconds.",
  },
  {
    icon: Search,
    title: "Browse listings nearby",
    body: "Tap Browse anytime to see what your neighbors are offering — cleaning, tutoring, repairs, dog walks, and a lot more.",
    target: "nav-browse",
    placement: "bottom",
  },
  {
    icon: SlidersHorizontal,
    title: "Filter to your block",
    body: "Narrow by category, city, or budget. Search keywords like 'leaky faucet' or 'deep clean' to skip straight to the right person.",
  },
  {
    icon: CalendarCheck,
    title: "Request a booking in two taps",
    body: "Open any listing, pick a time and how many hours, and send a request. The seller confirms — then Stripe handles the rest in test mode.",
  },
  {
    icon: MessageCircle,
    title: "Chat with sellers",
    body: "Have a question before you book? Tap the message icon to start a thread. All your conversations live here.",
    target: "nav-messages",
    placement: "bottom",
  },
  {
    icon: Star,
    title: "Leave a review when it's done",
    body: "After a booking wraps, drop a quick review from the booking page. Honest reviews keep the loop healthy.",
    target: "nav-account",
    placement: "left",
  },
  {
    icon: Sparkles,
    title: "You're all set",
    body: (
      <>
        Go find your next great neighbor.{" "}
        <a href="https://letsbuildmyapp.com" className="text-primary underline-offset-2 hover:underline">
          Built by letsbuildmyapp.com
        </a>
        .
      </>
    ),
  },
];

const SELLER_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome, neighbor",
    body: "You're set up as a seller — meaning you can post listings and take bookings. Quick tour of your tools and you're earning.",
  },
  {
    icon: Store,
    title: "Your seller hub",
    body: "Seller hub is home base — listings, requests, and earnings all in one warm corner.",
    target: "nav-seller-hub",
    placement: "bottom",
  },
  {
    icon: Plus,
    title: "Post your first listing",
    body: "Tap New listing to add a service. Title it like a neighbor would — clear, friendly, and honest about price.",
    target: "nav-new-listing",
    placement: "bottom",
  },
  {
    icon: Inbox,
    title: "Manage incoming requests",
    body: "When someone books you, the request lands in the Seller hub. Accept or decline with one tap — we'll notify the buyer.",
  },
  {
    icon: MessageCircle,
    title: "Talk to your buyers",
    body: "Every booking has a thread. Open Messages to keep the conversation in one place.",
    target: "nav-messages",
    placement: "bottom",
  },
  {
    icon: Wallet,
    title: "Track your earnings",
    body: "Your hub shows total earnings (test mode), pending requests, and active listings at a glance. Real payouts happen via Stripe Connect when you go live.",
  },
  {
    icon: Sparkles,
    title: "Off you go",
    body: (
      <>
        Make it personal — neighbors book sellers they trust.{" "}
        <a href="https://letsbuildmyapp.com" className="text-primary underline-offset-2 hover:underline">
          Built by letsbuildmyapp.com
        </a>
        .
      </>
    ),
  },
];

const ADMIN_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome, admin",
    body: "You keep the loop healthy. Three-stop tour and you're moderating.",
  },
  {
    icon: ShieldCheck,
    title: "Open the moderation panel",
    body: "Admin panel surfaces every user and listing in the system. Land here whenever something needs a second pair of eyes.",
    target: "nav-admin",
    placement: "bottom",
  },
  {
    icon: UserCircle,
    title: "Suspend listings or users",
    body: "Each row has a Suspend button. Suspended listings disappear from Browse instantly; suspended users can't post or book until you reinstate them.",
  },
  {
    icon: Sparkles,
    title: "You're set",
    body: (
      <>
        Be fair. Be quick.{" "}
        <a href="https://letsbuildmyapp.com" className="text-primary underline-offset-2 hover:underline">
          Built by letsbuildmyapp.com
        </a>
        .
      </>
    ),
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tutorial() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < MOBILE_BREAKPOINT,
  );

  const role = profile?.role;
  const STEPS = useMemo<Step[]>(() => {
    if (role === "seller") return SELLER_STEPS;
    if (role === "admin") return ADMIN_STEPS;
    return BUYER_STEPS;
  }, [role]);

  useEffect(() => {
    setStep(0);
  }, [STEPS]);

  // First-run check — per role, per device
  useEffect(() => {
    if (!user || !role) {
      setOpen(false);
      return;
    }
    const seen = localStorage.getItem(TUTORIAL_KEY_PREFIX + role);
    setOpen(!seen);
    setStep(0);
  }, [user, role]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const close = useCallback(() => {
    if (role) localStorage.setItem(TUTORIAL_KEY_PREFIX + role, "1");
    setOpen(false);
  }, [role]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length - 1) return s + 1;
      close();
      return s;
    });
  }, [close, STEPS.length]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  const currentStep = STEPS[step];
  const targetSel = currentStep?.target;

  useLayoutEffect(() => {
    if (!open || isMobile || !targetSel) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = document.querySelector(`[data-tour="${targetSel}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, isMobile, targetSel, step]);

  if (!open || !currentStep) return null;

  const hasTarget = !!rect && !!targetSel;
  if (isMobile || !hasTarget) {
    return (
      <CenteredModal
        steps={STEPS}
        step={step}
        onClose={close}
        onNext={next}
        onBack={back}
        onJump={setStep}
      />
    );
  }

  // Desktop spotlight
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;
  const PAD = 16;
  const TOOLTIP_W = 380;
  const TOOLTIP_H_EST = 320;
  let top = 0;
  let left = 0;
  if (rect) {
    const placement = currentStep.placement ?? "bottom";
    if (placement === "right") {
      left = rect.left + rect.width + PAD;
      top = rect.top;
      if (left + TOOLTIP_W > window.innerWidth - PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === "left") {
      left = rect.left - TOOLTIP_W - PAD;
      top = rect.top;
      if (left < PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === "bottom") {
      left = rect.left;
      top = rect.top + rect.height + PAD;
    } else if (placement === "top") {
      left = rect.left;
      top = rect.top - TOOLTIP_H_EST - PAD;
    }
    left = Math.min(Math.max(PAD, left), window.innerWidth - TOOLTIP_W - PAD);
    top = Math.min(Math.max(PAD, top), window.innerHeight - TOOLTIP_H_EST - PAD);
  }
  const tipStyle: React.CSSProperties = { top, left, width: TOOLTIP_W };

  return (
    <AnimatePresence>
      <motion.div
        key="spot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={close}
      >
        {hasTarget && rect ? (
          <motion.div
            initial={false}
            animate={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute pointer-events-none"
            style={{
              borderRadius: 18,
              boxShadow:
                "0 0 0 9999px rgba(20, 12, 8, 0.72), 0 0 0 3px hsl(var(--primary)), 0 0 0 8px hsl(var(--primary) / 0.25)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/72 backdrop-blur-sm" />
        )}
      </motion.div>

      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="fixed z-[101] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_20px_60px_-20px_rgba(255,138,91,0.45),0_8px_30px_-12px_rgba(20,12,8,0.25)]"
        style={tipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Tour · <span className="tabular-nums">{step + 1}</span> of{" "}
            <span className="tabular-nums">{STEPS.length}</span>
          </span>
          <button
            onClick={close}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-2 pt-4">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Icon size={22} />
          </div>
          <h2
            id="tutorial-title"
            className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground"
          >
            {currentStep.title}
          </h2>
          <div className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {currentStep.body}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/40 px-5 py-4">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={
                  i === step
                    ? "h-2 w-6 rounded-full bg-primary transition-all"
                    : "h-2 w-2 rounded-full bg-border transition-all hover:bg-muted-foreground/60"
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={back}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-full px-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
            >
              {isLast ? "Done" : "Next"} {!isLast ? <ArrowRight size={14} /> : null}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CenteredModal({
  steps,
  step,
  onClose,
  onNext,
  onBack,
  onJump,
}: {
  steps: Step[];
  step: number;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
}) {
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center bg-black/72 px-4 py-8 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title-c"
          className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_30px_80px_-25px_rgba(255,138,91,0.55),0_12px_40px_-15px_rgba(20,12,8,0.35)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Tour · <span className="tabular-nums">{step + 1}</span> of{" "}
              <span className="tabular-nums">{steps.length}</span>
            </span>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-7 pb-2 pt-5">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Icon size={26} />
            </div>
            <h2
              id="tutorial-title-c"
              className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground"
            >
              {current.title}
            </h2>
            <div className="mt-3 text-base leading-relaxed text-muted-foreground">
              {current.body}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/40 px-5 py-4">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={
                    i === step
                      ? "h-2 w-6 rounded-full bg-primary transition-all"
                      : "h-2 w-2 rounded-full bg-border transition-all hover:bg-muted-foreground/60"
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  onClick={onBack}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="inline-flex h-10 items-center rounded-full px-3 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Skip
                </button>
              )}
              <button
                onClick={onNext}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
              >
                {isLast ? "Done" : "Next"} {!isLast ? <ArrowRight size={14} /> : null}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
