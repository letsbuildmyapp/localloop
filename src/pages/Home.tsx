import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { ArrowRight, ShieldCheck, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const nav = useNavigate();
  const [featured, setFeatured] = useState<Listing[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "listings"), orderBy("rating", "desc"), limit(6)));
        setFeatured(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        setFeatured([]);
      }
    })();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="blob-bg relative overflow-hidden">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Now in 6 cities
            </span>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              Help from a neighbor, <span className="text-primary">not a faceless app.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Cleaners, handymen, dog walkers and more — all reviewed by people on your block. Book in minutes, pay securely.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => nav("/browse")}>
                Find a pro near me <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => nav("/signup?role=seller")}>
                Earn as a pro
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 avg rating</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Stripe-secured</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80" alt="Cleaner" className="aspect-[4/5] rounded-lg object-cover shadow-lg" />
              <div className="flex flex-col gap-4">
                <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80" alt="Dog walker" className="aspect-square rounded-lg object-cover shadow-lg" />
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80" alt="Handyman" className="aspect-square rounded-lg object-cover shadow-lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Pick a category</h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/browse?category=${c.id}`}
              className={`group flex flex-col items-center gap-3 rounded-lg border bg-gradient-to-br ${c.tint} p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-ring`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-md bg-background/80 shadow-sm">
                <c.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-neutral-900">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container py-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Top-rated this week</h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline">See all</Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured === null
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-lg" />)
            : featured.length === 0
              ? <p className="text-sm text-muted-foreground">No listings yet — start the emulator and run the seed script.</p>
              : featured.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Trust strip */}
      <section className="container py-16">
        <div className="rounded-lg border bg-secondary/50 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { n: "1", t: "Browse trusted neighbors", d: "Every pro is verified and rated by real customers in your zip code." },
              { n: "2", t: "Book and pay in-app", d: "Stripe-secured payments. You're only charged when the job's accepted." },
              { n: "3", t: "Message until it's done", d: "Built-in chat keeps everything in one place — no lost texts." },
            ].map((s) => (
              <div key={s.n}>
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
