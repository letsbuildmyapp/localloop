import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Tell us what you need",
      body: "Browse trusted neighbors by category, price, and zip. Every pro is reviewed by real people on your street.",
    },
    {
      title: "2. Send a request",
      body: "Pick a date, add notes, and request a booking. Your card is held — not charged — until the pro accepts.",
    },
    {
      title: "3. Pay securely, message in-app",
      body: "Payments are processed by Stripe. You and your pro can chat in the app to coordinate timing or scope changes.",
    },
    {
      title: "4. Leave a review",
      body: "After the job, leave a star rating and a quick note. Your review helps the next neighbor pick with confidence.",
    },
  ];

  return (
    <section className="container max-w-3xl py-16">
      <h1 className="font-display text-5xl font-semibold">How LocalLoop works</h1>
      <p className="mt-3 text-lg text-muted-foreground">Booked in four taps. No call-arounds, no quote roulette.</p>

      <ol className="mt-10 space-y-8">
        {steps.map((s) => (
          <li key={s.title} className="flex gap-4">
            <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-1 text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link to="/browse">Find a pro</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/signup?role=seller">Earn as a pro</Link></Button>
      </div>
    </section>
  );
}
